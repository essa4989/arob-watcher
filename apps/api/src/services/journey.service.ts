import { prisma } from '../db/prisma';
import { sendTelegram, buildEntryMessage } from './telegram.service';
import { checkRewards } from './reward.service';
import { dateStr } from '../utils/time';
import { STAR_LEVELS, STREAK_MILESTONES, type EntryType, type JourneyLevel } from '@arob/shared';

export function levelForTotal(total: number): { level: JourneyLevel; next: JourneyLevel | null } {
  let current = STAR_LEVELS[0];
  for (const l of STAR_LEVELS) {
    if (total >= l.stars) current = l;
    else break;
  }
  const idx = STAR_LEVELS.findIndex((l) => l.level === current.level);
  const nextRaw = STAR_LEVELS[idx + 1] ?? null;
  const toDto = (l: (typeof STAR_LEVELS)[number], next: number | null): JourneyLevel => ({
    level: l.level,
    name: l.nameAr,
    emoji: l.emoji,
    stars: l.stars,
    next,
  });
  return {
    level: toDto(current, nextRaw?.stars ?? null),
    next: nextRaw ? toDto(nextRaw, null) : null,
  };
}

async function computeStreaks(childId: string): Promise<{ current: number; longest: number }> {
  const rows = await prisma.journeyLog.findMany({
    where: { childId },
    select: { timestamp: true },
    orderBy: { timestamp: 'asc' },
  });
  const days = Array.from(new Set(rows.map((r) => dateStr(r.timestamp)))).sort();
  if (days.length === 0) return { current: 0, longest: 0 };

  let longest = 1;
  let run = 1;
  for (let i = 1; i < days.length; i++) {
    const prev = new Date(days[i - 1]);
    const cur = new Date(days[i]);
    const gapDays = Math.round((cur.getTime() - prev.getTime()) / 86400000);
    run = gapDays === 1 ? run + 1 : 1;
    longest = Math.max(longest, run);
  }

  const today = dateStr();
  const yesterday = dateStr(new Date(Date.now() - 86400000));
  const lastDay = days[days.length - 1];
  let current = 0;
  if (lastDay === today || lastDay === yesterday) {
    current = 1;
    for (let i = days.length - 1; i > 0; i--) {
      const prev = new Date(days[i - 1]);
      const cur = new Date(days[i]);
      const gapDays = Math.round((cur.getTime() - prev.getTime()) / 86400000);
      if (gapDays === 1) current++;
      else break;
    }
  }
  return { current, longest };
}

export async function getJourneyStatus(childId: string) {
  const total = await prisma.journeyLog.count({ where: { childId } });
  const today = await prisma.journeyLog.count({ where: { childId, timestamp: { gte: new Date(`${dateStr()}T00:00:00`) } } });
  const { level, next } = levelForTotal(total);
  const streaks = await computeStreaks(childId);

  const byTypeRows = await prisma.journeyLog.groupBy({ by: ['type'], where: { childId }, _count: { type: true } });
  const by_type = Object.fromEntries(byTypeRows.map((r) => [r.type, r._count.type])) as Record<EntryType, number>;
  for (const t of ['catheter', 'medication', 'check', 'fluid', 'care'] as EntryType[]) {
    if (!(t in by_type)) by_type[t] = 0;
  }

  const progress = next ? Math.min(100, Math.round(((total - level.stars) / (next.stars - level.stars)) * 100)) : 100;

  return {
    ok: true as const,
    total_stars: total,
    today_stars: today,
    current_streak: streaks.current,
    longest_streak: streaks.longest,
    level,
    next_level: next,
    progress_to_next: progress,
    by_type,
  };
}

export async function awardStar(childId: string, type: EntryType, device?: string) {
  const beforeTotal = await prisma.journeyLog.count({ where: { childId } });
  const { level: beforeLevel } = levelForTotal(beforeTotal);

  const afterTotal = beforeTotal + 1;
  await prisma.journeyLog.create({ data: { childId, type, device, totalAtTime: afterTotal } });

  const { level: afterLevel } = levelForTotal(afterTotal);
  const leveledUp = afterLevel.level !== beforeLevel.level;
  const streaks = await computeStreaks(childId);

  if (leveledUp) {
    await sendTelegram(
      buildEntryMessage('care', [`🎉 ترقية مستوى جديد!`, `${afterLevel.emoji} ${afterLevel.name}`, `⭐ إجمالي النجوم: ${afterTotal}`]).replace(
        '🌸 تسجيل عناية',
        '🎉 ترقية مستوى',
      ),
    );
  }
  if (STREAK_MILESTONES.includes(streaks.current)) {
    await sendTelegram(
      buildEntryMessage('care', [`🔥 سلسلة ${streaks.current} يوم متتالٍ!`, 'استمروا، عروب بطلة 💪']).replace('🌸 تسجيل عناية', '🔥 إنجاز سلسلة'),
    );
  }

  await checkRewards(childId, afterTotal);

  return {
    ok: true as const,
    total: afterTotal,
    today: (await getJourneyStatus(childId)).today_stars,
    level: { level: afterLevel.level, name: afterLevel.name, emoji: afterLevel.emoji, stars: afterLevel.stars, next: afterLevel.next },
    leveledUp,
    streak: streaks.current,
  };
}

export async function getHonorBoard(childId: string, limit = 20) {
  return prisma.journeyLog.findMany({ where: { childId }, orderBy: { timestamp: 'desc' }, take: limit });
}

export async function undoLastStar(childId: string, device?: string) {
  const last = await prisma.journeyLog.findFirst({ where: { childId }, orderBy: { timestamp: 'desc' } });
  if (!last) {
    return { ok: false as const, error: 'لا توجد نجوم' };
  }
  await prisma.journeyLog.delete({ where: { id: last.id } });
  await sendTelegram(buildEntryMessage('care', ['↩️ تراجع عن آخر نجمة']).replace('🌸 تسجيل عناية', '↩️ تراجع'));
  return { ok: true as const };
}
