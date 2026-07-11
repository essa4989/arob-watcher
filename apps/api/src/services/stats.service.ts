import { prisma } from '../db/prisma';
import { dateStr } from '../utils/time';
import { sendTelegram, buildEntryMessage } from './telegram.service';
import type { StatsResponse } from '@arob/shared';

export type Period = 'daily' | 'weekly' | 'monthly' | 'all';

export function periodRange(period: Period): { from: Date; to: Date } {
  const to = new Date();
  const from = new Date();
  switch (period) {
    case 'daily':
      from.setHours(0, 0, 0, 0);
      break;
    case 'weekly':
      from.setDate(from.getDate() - 7);
      break;
    case 'monthly':
      from.setDate(from.getDate() - 30);
      break;
    case 'all':
      from.setFullYear(2000);
      break;
  }
  return { from, to };
}

export async function getStats(childId: string, period: Period): Promise<StatsResponse> {
  const { from, to } = periodRange(period);
  const range = { timestamp: { gte: from, lte: to } };

  const [catheter, medication, check, fluid, care, urineAgg, fluidAgg] = await Promise.all([
    prisma.catheterLog.count({ where: { childId, ...range } }),
    prisma.medicationLog.count({ where: { childId, ...range } }),
    prisma.checkLog.count({ where: { childId, ...range } }),
    prisma.fluidLog.count({ where: { childId, ...range } }),
    prisma.careLog.count({ where: { childId, ...range } }),
    prisma.catheterLog.aggregate({ where: { childId, ...range }, _sum: { amount: true } }),
    prisma.fluidLog.aggregate({ where: { childId, ...range }, _sum: { amount: true } }),
  ]);

  const total_urine = urineAgg._sum.amount ?? 0;
  const total_fluid = fluidAgg._sum.amount ?? 0;

  return {
    ok: true,
    counts: { catheter, medication, check, fluid, care },
    total_urine,
    total_fluid,
    balance: total_fluid - total_urine,
    from: from.toISOString(),
    to: to.toISOString(),
  };
}

export async function sendDailyReport(childId: string) {
  const stats = await getStats(childId, 'daily');
  const lines = [
    `📊 التقرير اليومي — ${dateStr()}`,
    `💗 قسطرة: ${stats.counts.catheter} مرة (${stats.total_urine} ml)`,
    `💊 أدوية: ${stats.counts.medication} مرة`,
    `🩺 فحوصات: ${stats.counts.check} مرة`,
    `💧 سوائل: ${stats.counts.fluid} مرة (${stats.total_fluid} ml)`,
    `🌸 عناية: ${stats.counts.care} مرة`,
    `⚖️ التوازن: ${stats.balance} ml`,
  ];
  await sendTelegram(buildEntryMessage('care', lines).replace('🌸 تسجيل عناية', '📊 التقرير اليومي'));
  return stats;
}
