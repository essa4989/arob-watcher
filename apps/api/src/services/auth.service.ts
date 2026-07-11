import bcrypt from 'bcryptjs';
import { prisma } from '../db/prisma';
import { env } from '../config/env';
import { logAudit } from './audit.service';
import { sendTelegram, buildEntryMessage } from './telegram.service';
import { ROLE_CAPABILITIES, SESSION_TTL_HOURS, type Role } from '@arob/shared';
import type { Role as PrismaRole } from '@prisma/client';

const ROLES: PrismaRole[] = ['parent', 'nurse', 'doctor'];

/** Seeds default PINs (from env, or the legacy 1234/5678/9999) for any role missing a credential. */
export async function ensureDefaultCredentials() {
  for (const role of ROLES) {
    const existing = await prisma.credential.findUnique({ where: { role } });
    if (!existing) {
      const defaultPin = env.defaultPins[role as Role];
      const pinHash = await bcrypt.hash(defaultPin, 10);
      await prisma.credential.create({ data: { role, pinHash } });
      console.log(`[auth] seeded default PIN for role=${role}`);
    }
  }
}

export async function verifyPin(pin: string, device: string) {
  for (const role of ROLES) {
    const cred = await prisma.credential.findUnique({ where: { role } });
    if (!cred) continue;
    const match = await bcrypt.compare(pin, cred.pinHash);
    if (match) {
      const expiresAt = new Date(Date.now() + SESSION_TTL_HOURS * 3600 * 1000);
      const session = await prisma.session.create({ data: { role, device, expiresAt } });
      await logAudit('login_success', { device }, device, role);
      return {
        ok: true as const,
        role,
        token: session.token,
        capabilities: ROLE_CAPABILITIES[role as Role],
      };
    }
  }
  await logAudit('login_failed', { device }, device);
  return { ok: false as const, error: 'رمز الدخول غير صحيح' };
}

export async function verifySession(token: string | undefined) {
  if (!token) return null;
  const session = await prisma.session.findUnique({ where: { token } });
  if (!session) return null;
  if (session.expiresAt.getTime() < Date.now()) {
    await prisma.session.delete({ where: { token } }).catch(() => undefined);
    return null;
  }
  return session;
}

export function getCapabilities(role: Role) {
  return ROLE_CAPABILITIES[role];
}

export async function changePin(token: string, targetRole: Role, newPin: string, device?: string) {
  const session = await verifySession(token);
  if (!session || session.role !== 'parent') {
    return { ok: false as const, error: 'غير مصرح' };
  }
  if (!/^\d{4,8}$/.test(newPin)) {
    return { ok: false as const, error: 'الرمز يجب أن يكون 4-8 أرقام' };
  }
  const pinHash = await bcrypt.hash(newPin, 10);
  await prisma.credential.upsert({
    where: { role: targetRole },
    update: { pinHash },
    create: { role: targetRole, pinHash },
  });
  await logAudit('pin_changed', { targetRole }, device, session.role);
  await sendTelegram(buildEntryMessage('care', [`🔐 تم تغيير رمز الدخول لدور: ${targetRole}`]).replace('🌸 تسجيل عناية', '🔐 تغيير أمني'));
  return { ok: true as const };
}
