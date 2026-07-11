import { prisma } from '../db/prisma';
import { getSleepConfig, isSleepTimeNow } from './sleep.service';
import { diffMinutes } from '../utils/time';
import { CATHETER_ALERT_LEVELS, CATHETER_IDEAL_INTERVAL_MIN, type StatusResponse } from '@arob/shared';

export const APP_VERSION = 'v1.0 (independent platform)';

export async function getLastCatheter(childId: string) {
  return prisma.catheterLog.findFirst({ where: { childId }, orderBy: { timestamp: 'desc' } });
}

export function computeAlertLevel(diffMin: number | null) {
  if (diffMin === null) {
    return { level: 0 as const, emoji: '⚪', labelAr: 'لا توجد بيانات بعد' };
  }
  for (const l of CATHETER_ALERT_LEVELS) {
    if (diffMin >= l.minMinutes) return l;
  }
  return { level: 0 as const, emoji: '🟢', labelAr: 'ضمن الفترة الطبيعية' };
}

function kidneyMessage(level: number): string {
  switch (level) {
    case 5:
      return '🚨 خطر مباشر على الكلى — اتصل بالطبيب الآن';
    case 4:
      return '🔴 ضغط شديد على الكلى — إجراء فوري مطلوب';
    case 3:
      return '🟠 ضغط متزايد على الكلى';
    case 2:
      return '🟡 احتمال احتباس بولي';
    case 1:
      return '🟢 تأخر عن الفترة المثالية';
    default:
      return '✅ كل شيء ضمن المعدل الطبيعي';
  }
}

export async function getStatus(childId: string): Promise<StatusResponse> {
  try {
    const last = await getLastCatheter(childId);
    const diff = last ? diffMinutes(last.timestamp) : null;
    const level = computeAlertLevel(diff);
    const sleep = await getSleepConfig(childId);
    const isSleepNow = await isSleepTimeNow(childId);

    return {
      ok: true,
      last_catheter: last ? last.timestamp.toISOString() : null,
      diff_minutes: diff,
      alert_level: level.level as StatusResponse['alert_level'],
      alert_label: 'labelAr' in level ? level.labelAr : '',
      alert_emoji: level.emoji,
      kidney_msg: kidneyMessage(level.level),
      sleep_mode: sleep.enabled,
      sleep_from: sleep.from,
      sleep_to: sleep.to,
      is_sleep_now: isSleepNow,
      server_time: new Date().toISOString(),
      version: APP_VERSION,
    };
  } catch (err) {
    // Defensive: the live timer must never crash even on partial failure.
    console.error('[catheter] getStatus failed', err);
    return {
      ok: true,
      last_catheter: null,
      diff_minutes: null,
      alert_level: 0,
      alert_label: 'تعذّر تحميل الحالة',
      alert_emoji: '⚪',
      kidney_msg: '',
      sleep_mode: false,
      sleep_from: '23:00',
      sleep_to: '07:00',
      is_sleep_now: false,
      server_time: new Date().toISOString(),
      version: APP_VERSION,
    };
  }
}

export { CATHETER_IDEAL_INTERVAL_MIN };
