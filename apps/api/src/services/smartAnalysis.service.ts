import { prisma } from '../db/prisma';
import { sendTelegram, buildEntryMessage } from './telegram.service';
import { periodRange, type Period } from './stats.service';
import { dateStr } from '../utils/time';
import {
  FEVER_C,
  HIGH_FEVER_C,
  FLUID_BALANCE_DEHYDRATION_ML,
  FLUID_BALANCE_RETENTION_ML,
  PATTERN_RULES,
  type SmartSummaryResponse,
  type Pattern,
} from '@arob/shared';

async function analyzeCatheter(childId: string, from: Date, to: Date) {
  const rows = await prisma.catheterLog.findMany({
    where: { childId, timestamp: { gte: from, lte: to } },
    orderBy: { timestamp: 'asc' },
  });
  const amounts = rows.map((r) => r.amount);
  const total = amounts.reduce((a, b) => a + b, 0);
  const avg = amounts.length ? Math.round(total / amounts.length) : 0;
  const min = amounts.length ? Math.min(...amounts) : 0;
  const max = amounts.length ? Math.max(...amounts) : 0;
  let avgIntervalMin = 0;
  if (rows.length > 1) {
    const gaps = rows.slice(1).map((r, i) => (r.timestamp.getTime() - rows[i].timestamp.getTime()) / 60000);
    avgIntervalMin = Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length);
  }
  return {
    count: rows.length,
    total,
    avg,
    min,
    max,
    avgIntervalMin,
    bloody: rows.filter((r) => r.color === 'دموي').length,
    cloudy: rows.filter((r) => r.color === 'عكر').length,
    badSmell: rows.filter((r) => r.smell === 'كريه').length,
    pain: rows.filter((r) => r.pain === 'نعم').length,
  };
}

async function analyzeVitals(childId: string, from: Date, to: Date) {
  const rows = await prisma.checkLog.findMany({ where: { childId, timestamp: { gte: from, lte: to } } });
  const temps = rows.map((r) => r.temp).filter((t): t is number => typeof t === 'number');
  const pulses = rows.map((r) => r.pulse).filter((p): p is number => typeof p === 'number');
  const spo2s = rows.map((r) => r.spo2).filter((s): s is number => typeof s === 'number');
  return {
    count: rows.length,
    highFever: temps.filter((t) => t >= HIGH_FEVER_C).length,
    fever: temps.filter((t) => t >= FEVER_C && t < HIGH_FEVER_C).length,
    avgTemp: temps.length ? Number((temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1)) : null,
    maxTemp: temps.length ? Math.max(...temps) : null,
    avgPulse: pulses.length ? Math.round(pulses.reduce((a, b) => a + b, 0) / pulses.length) : null,
    minSpo2: spo2s.length ? Math.min(...spo2s) : null,
  };
}

async function analyzeFluids(childId: string, from: Date, to: Date) {
  const rows = await prisma.fluidLog.findMany({ where: { childId, timestamp: { gte: from, lte: to } } });
  return {
    total: rows.reduce((a, r) => a + r.amount, 0),
    refused: rows.filter((r) => r.response === 'رفضت').length,
  };
}

async function analyzeMedication(childId: string, from: Date, to: Date) {
  const given = await prisma.medicationLog.count({ where: { childId, timestamp: { gte: from, lte: to } } });
  const { getMissedMedsToday } = await import('./medSchedule.service');
  const missedToday = await getMissedMedsToday(childId);
  return { given, missedToday: missedToday.length };
}

export async function smartSummary(childId: string, period: Period): Promise<SmartSummaryResponse> {
  const { from, to } = periodRange(period === 'daily' ? 'daily' : 'weekly');
  const [cath, vitals, fluids, meds] = await Promise.all([
    analyzeCatheter(childId, from, to),
    analyzeVitals(childId, from, to),
    analyzeFluids(childId, from, to),
    analyzeMedication(childId, from, to),
  ]);

  const balance = fluids.total - cath.total;
  const insights: string[] = [];
  const recommendations: string[] = [];
  const flags: SmartSummaryResponse['flags'] = [];

  insights.push(`💗 قسطرة: ${cath.count} مرة، متوسط الكمية ${cath.avg} ml، متوسط الفاصل ${cath.avgIntervalMin} دقيقة`);
  if (vitals.count > 0) insights.push(`🩺 فحوصات: ${vitals.count}، متوسط الحرارة ${vitals.avgTemp ?? '—'}°`);
  insights.push(`💧 السوائل: ${fluids.total} ml، البول: ${cath.total} ml، التوازن: ${balance} ml`);
  insights.push(`💊 أدوية معطاة: ${meds.given}، فائتة اليوم: ${meds.missedToday}`);

  if (cath.bloody > 0) {
    flags.push({ level: 'critical', message: `🚨 بول دموي رُصد ${cath.bloody} مرة` });
    recommendations.push('التواصل مع الطبيب فوراً بخصوص البول الدموي');
  }
  if (vitals.highFever > 0) {
    flags.push({ level: 'critical', message: `🚨 حمى عالية رُصدت ${vitals.highFever} مرة` });
    recommendations.push('متابعة الحرارة عن كثب واستشارة الطبيب إذا استمرت');
  } else if (vitals.fever > 0) {
    flags.push({ level: 'warning', message: `⚠️ حمى متوسطة رُصدت ${vitals.fever} مرة` });
  }
  if (balance <= FLUID_BALANCE_DEHYDRATION_ML) {
    flags.push({ level: 'warning', message: `⚠️ توازن سلبي (${balance} ml) — احتمال جفاف` });
    recommendations.push('زيادة كمية السوائل المُقدَّمة');
  } else if (balance >= FLUID_BALANCE_RETENTION_ML) {
    flags.push({ level: 'warning', message: `⚠️ توازن موجب مرتفع (${balance} ml) — احتمال احتباس` });
  }
  if (cath.avg > 0 && cath.avg < 50) {
    flags.push({ level: 'warning', message: `⚠️ متوسط كمية البول منخفض (${cath.avg} ml)` });
  }
  if (meds.missedToday > 0) {
    flags.push({ level: 'warning', message: `⚠️ ${meds.missedToday} جرعة دواء فائتة اليوم` });
    recommendations.push('مراجعة جدول الأدوية والتأكد من إعطاء الجرعات الفائتة');
  }
  if (fluids.refused > 0) {
    recommendations.push('تجربة أنواع سوائل مختلفة لتشجيع الشرب');
  }
  if (flags.length === 0) {
    flags.push({ level: 'info', message: '✅ لا توجد مؤشرات مقلقة في هذه الفترة' });
  }

  const summary = `ملخص ${period === 'daily' ? 'اليوم' : 'الأسبوع'}: ${insights.join(' | ')}`;

  await sendTelegram(
    buildEntryMessage('care', [summary, ...flags.map((f) => f.message)]).replace('🌸 تسجيل عناية', '🧠 الملخص الذكي'),
  );

  return { ok: true, summary, insights, recommendations: recommendations.slice(0, 5), flags };
}

export async function detectPatterns(childId: string, days = 7): Promise<{ ok: true; patterns: Pattern[]; days: number }> {
  const from = new Date(Date.now() - days * 86400000);
  const to = new Date();
  const patterns: Pattern[] = [];

  const checks = await prisma.checkLog.findMany({ where: { childId, timestamp: { gte: from, lte: to } } });
  const feverDays = new Set(
    checks.filter((c) => (c.temp ?? 0) >= PATTERN_RULES.recurringFever.minTempC).map((c) => dateStr(c.timestamp)),
  );
  if (feverDays.size >= PATTERN_RULES.recurringFever.minDaysOutOf7) {
    patterns.push({
      severity: PATTERN_RULES.recurringFever.severity,
      type: 'recurring_fever',
      title: 'حمى متكررة',
      description: `حرارة ≥38° رُصدت في ${feverDays.size} أيام خلال آخر ${days} أيام`,
      recommendation: 'استشارة الطبيب لتقييم سبب الحمى المتكررة',
    });
  }

  const cathLogs = await prisma.catheterLog.findMany({ where: { childId, timestamp: { gte: from, lte: to } } });
  const lowUrineCount = cathLogs.filter((c) => c.amount < PATTERN_RULES.lowUrine.maxMl).length;
  if (lowUrineCount >= PATTERN_RULES.lowUrine.minOccurrences) {
    patterns.push({
      severity: PATTERN_RULES.lowUrine.severity,
      type: 'low_urine',
      title: 'انخفاض متكرر في كمية البول',
      description: `${lowUrineCount} حالة بكمية أقل من ${PATTERN_RULES.lowUrine.maxMl} ml`,
      recommendation: 'مراقبة الترطيب واستشارة الطبيب إذا استمر الانخفاض',
    });
  }

  const bloodyCount = cathLogs.filter((c) => c.color === 'دموي').length;
  if (bloodyCount > 0) {
    patterns.push({
      severity: PATTERN_RULES.bloodyUrine.severity,
      type: 'bloody_urine',
      title: 'بول دموي',
      description: `رُصد ${bloodyCount} مرة خلال آخر ${days} أيام`,
      recommendation: 'التواصل الفوري مع الطبيب',
    });
  }

  const fluidLogs = await prisma.fluidLog.findMany({ where: { childId, timestamp: { gte: from, lte: to } } });
  const refusalCount = fluidLogs.filter((f) => f.response === 'رفضت').length;
  if (refusalCount >= PATTERN_RULES.fluidRefusal.minOccurrences) {
    patterns.push({
      severity: PATTERN_RULES.fluidRefusal.severity,
      type: 'fluid_refusal',
      title: 'رفض متكرر للسوائل',
      description: `${refusalCount} حالة رفض خلال آخر ${days} أيام`,
      recommendation: 'تنويع أنواع السوائل المُقدَّمة',
    });
  }

  return { ok: true, patterns, days };
}
