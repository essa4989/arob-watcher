import { prisma } from '../db/prisma';
import { sendTelegram, buildEntryMessage } from './telegram.service';
import { logAudit } from './audit.service';
import { setSetting } from './settings.service';
import { UNDO_WINDOW_MIN, type EntryType } from '@arob/shared';
import type { Role } from '@prisma/client';

async function findLast(childId: string, type: EntryType) {
  switch (type) {
    case 'catheter':
      return prisma.catheterLog.findFirst({ where: { childId }, orderBy: { timestamp: 'desc' } });
    case 'medication':
      return prisma.medicationLog.findFirst({ where: { childId }, orderBy: { timestamp: 'desc' } });
    case 'check':
      return prisma.checkLog.findFirst({ where: { childId }, orderBy: { timestamp: 'desc' } });
    case 'fluid':
      return prisma.fluidLog.findFirst({ where: { childId }, orderBy: { timestamp: 'desc' } });
    case 'care':
      return prisma.careLog.findFirst({ where: { childId }, orderBy: { timestamp: 'desc' } });
  }
}

async function deleteById(type: EntryType, id: string) {
  switch (type) {
    case 'catheter':
      return prisma.catheterLog.delete({ where: { id } });
    case 'medication':
      return prisma.medicationLog.delete({ where: { id } });
    case 'check':
      return prisma.checkLog.delete({ where: { id } });
    case 'fluid':
      return prisma.fluidLog.delete({ where: { id } });
    case 'care':
      return prisma.careLog.delete({ where: { id } });
  }
}

export async function deleteLastEntry(childId: string, type: EntryType, device?: string, role?: Role) {
  const last = await findLast(childId, type);
  if (!last) {
    return { ok: false as const, error: 'لا توجد إدخالات' };
  }
  const ageMin = (Date.now() - last.timestamp.getTime()) / 60000;
  if (ageMin > UNDO_WINDOW_MIN) {
    return { ok: false as const, error: 'يمكن الحذف خلال 30 دقيقة فقط من التسجيل' };
  }

  await deleteById(type, last.id);

  if (type === 'catheter') {
    const previous = await prisma.catheterLog.findFirst({ where: { childId }, orderBy: { timestamp: 'desc' } });
    await setSetting(childId, 'cath_sent_levels', JSON.stringify([]));
    await setSetting(childId, 'cath_cycle_start', previous ? previous.timestamp.toISOString() : '');
  }

  await logAudit('entry_deleted', { type, id: last.id }, device, role);
  await sendTelegram(buildEntryMessage('care', [`🗑️ تم حذف آخر إدخال: ${type}`]).replace('🌸 تسجيل عناية', '🗑️ حذف إدخال'));
  return { ok: true as const };
}
