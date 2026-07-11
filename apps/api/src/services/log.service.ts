import { prisma } from '../db/prisma';
import type { Role } from '@prisma/client';
import { sendTelegram, buildEntryMessage } from './telegram.service';
import { detectCatheterAlerts, detectVitalsAlerts } from './alerts.service';
import { setSetting } from './settings.service';
import { dateStr, timeStr } from '../utils/time';
import type { LogInput } from '@arob/shared';

export interface LogContext {
  childId: string;
  device?: string;
  role?: Role;
}

export async function logEntry(input: LogInput, ctx: LogContext) {
  const { childId, device, role } = ctx;

  switch (input.type) {
    case 'catheter': {
      const row = await prisma.catheterLog.create({
        data: {
          childId,
          amount: input.amount,
          color: input.color,
          smell: input.smell,
          pain: input.pain,
          notes: input.notes,
          device,
          createdByRole: role,
        },
      });
      // New reading starts a fresh 90-minute cycle: clear which alert levels were already sent.
      await setSetting(childId, 'cath_sent_levels', JSON.stringify([]));
      await setSetting(childId, 'cath_cycle_start', row.timestamp.toISOString());

      await sendTelegram(
        buildEntryMessage('catheter', [
          `💧 الكمية: ${input.amount} ml`,
          input.color ? `🎨 اللون: ${input.color}` : '',
          input.smell ? `👃 الرائحة: ${input.smell}` : '',
          input.pain ? `😣 الألم: ${input.pain}` : '',
          input.notes ? `📝 ${input.notes}` : '',
        ].filter(Boolean)),
      );
      await detectCatheterAlerts(input);
      return { ok: true, type: 'catheter', timestamp: row.timestamp.toISOString(), id: row.id };
    }

    case 'medication': {
      const row = await prisma.medicationLog.create({
        data: {
          childId,
          med: input.med,
          dose: input.dose,
          method: input.method,
          response: input.response,
          notes: input.notes,
          medScheduleId: input.medScheduleId,
          device,
          createdByRole: role,
        },
      });
      if (input.medScheduleId && input.time) {
        await prisma.medGivenMark.upsert({
          where: {
            medScheduleId_date_time: { medScheduleId: input.medScheduleId, date: dateStr(), time: input.time },
          },
          update: { givenAt: new Date() },
          create: { medScheduleId: input.medScheduleId, date: dateStr(), time: input.time },
        });
      }
      await sendTelegram(
        buildEntryMessage('medication', [
          `💊 الدواء: ${input.med}`,
          input.dose ? `📏 الجرعة: ${input.dose}` : '',
          input.method ? `🔀 الطريقة: ${input.method}` : '',
          input.response ? `📋 الاستجابة: ${input.response}` : '',
          input.notes ? `📝 ${input.notes}` : '',
        ].filter(Boolean)),
      );
      return { ok: true, type: 'medication', timestamp: row.timestamp.toISOString(), id: row.id };
    }

    case 'check': {
      const row = await prisma.checkLog.create({
        data: {
          childId,
          temp: input.temp,
          bp: input.bp,
          pulse: input.pulse,
          spo2: input.spo2,
          skin: input.skin,
          consciousness: input.consciousness,
          position: input.position,
          notes: input.notes,
          device,
          createdByRole: role,
        },
      });
      await sendTelegram(
        buildEntryMessage('check', [
          input.temp !== undefined ? `🌡️ الحرارة: ${input.temp}°` : '',
          input.bp ? `🩸 الضغط: ${input.bp}` : '',
          input.pulse !== undefined ? `💓 النبض: ${input.pulse} bpm` : '',
          input.spo2 !== undefined ? `🫁 الأكسجين: ${input.spo2}%` : '',
          input.consciousness ? `🧠 الوعي: ${input.consciousness}` : '',
          input.notes ? `📝 ${input.notes}` : '',
        ].filter(Boolean)),
      );
      await detectVitalsAlerts(input);
      return { ok: true, type: 'check', timestamp: row.timestamp.toISOString(), id: row.id };
    }

    case 'fluid': {
      const row = await prisma.fluidLog.create({
        data: {
          childId,
          fluidType: input.fluidType,
          amount: input.amount,
          response: input.response,
          notes: input.notes,
          device,
          createdByRole: role,
        },
      });
      await sendTelegram(
        buildEntryMessage('fluid', [
          `💧 النوع: ${input.fluidType}`,
          `📏 الكمية: ${input.amount} ml`,
          input.response ? `📋 الاستجابة: ${input.response}` : '',
          input.notes ? `📝 ${input.notes}` : '',
        ].filter(Boolean)),
      );
      return { ok: true, type: 'fluid', timestamp: row.timestamp.toISOString(), id: row.id };
    }

    case 'care': {
      const row = await prisma.careLog.create({
        data: {
          childId,
          care: input.care,
          response: input.response,
          notes: input.notes,
          device,
          createdByRole: role,
        },
      });
      await sendTelegram(
        buildEntryMessage('care', [
          `🌸 العناية: ${input.care}`,
          input.response ? `📋 الاستجابة: ${input.response}` : '',
          input.notes ? `📝 ${input.notes}` : '',
        ].filter(Boolean)),
      );
      return { ok: true, type: 'care', timestamp: row.timestamp.toISOString(), id: row.id };
    }
  }
}

export async function getLogs(childId: string, limit = 30) {
  const [catheter, medication, check, fluid, care] = await Promise.all([
    prisma.catheterLog.findMany({ where: { childId }, orderBy: { timestamp: 'desc' }, take: limit }),
    prisma.medicationLog.findMany({ where: { childId }, orderBy: { timestamp: 'desc' }, take: limit }),
    prisma.checkLog.findMany({ where: { childId }, orderBy: { timestamp: 'desc' }, take: limit }),
    prisma.fluidLog.findMany({ where: { childId }, orderBy: { timestamp: 'desc' }, take: limit }),
    prisma.careLog.findMany({ where: { childId }, orderBy: { timestamp: 'desc' }, take: limit }),
  ]);
  const merged = [
    ...catheter.map((r) => ({ ...r, type: 'catheter' as const })),
    ...medication.map((r) => ({ ...r, type: 'medication' as const })),
    ...check.map((r) => ({ ...r, type: 'check' as const })),
    ...fluid.map((r) => ({ ...r, type: 'fluid' as const })),
    ...care.map((r) => ({ ...r, type: 'care' as const })),
  ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  return merged.slice(0, limit);
}

export async function getAllLogs(childId: string) {
  const [catheter, medication, check, fluid, care] = await Promise.all([
    prisma.catheterLog.findMany({ where: { childId }, orderBy: { timestamp: 'asc' } }),
    prisma.medicationLog.findMany({ where: { childId }, orderBy: { timestamp: 'asc' } }),
    prisma.checkLog.findMany({ where: { childId }, orderBy: { timestamp: 'asc' } }),
    prisma.fluidLog.findMany({ where: { childId }, orderBy: { timestamp: 'asc' } }),
    prisma.careLog.findMany({ where: { childId }, orderBy: { timestamp: 'asc' } }),
  ]);
  return { catheter, medication, check, fluid, care };
}
