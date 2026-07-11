import { prisma } from '../db/prisma';
import type { Role, Prisma } from '@prisma/client';

export async function logAudit(action: string, details: Record<string, unknown> = {}, device?: string, role?: Role) {
  await prisma.auditLog.create({ data: { action, details: details as Prisma.InputJsonValue, device, role } });
}

export async function logSettingChange(setting: string, oldValue: string | null, newValue: string, device?: string) {
  await prisma.settingsChangeLog.create({ data: { setting, oldValue: oldValue ?? undefined, newValue, device } });
}

export async function getAuditLog(limit = 50) {
  return prisma.auditLog.findMany({ orderBy: { timestamp: 'desc' }, take: limit });
}
