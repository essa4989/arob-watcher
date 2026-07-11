import { prisma } from '../db/prisma';
import { sendTelegram, buildEntryMessage } from './telegram.service';

export async function saveReward(
  childId: string,
  input: { id?: string; title: string; description?: string; starsNeeded: number },
) {
  const reward = input.id
    ? await prisma.reward.update({
        where: { id: input.id },
        data: { title: input.title, description: input.description, starsNeeded: input.starsNeeded },
      })
    : await prisma.reward.create({
        data: { childId, title: input.title, description: input.description, starsNeeded: input.starsNeeded },
      });

  if (!input.id) {
    await sendTelegram(
      buildEntryMessage('care', [`🎁 مكافأة جديدة: ${reward.title}`, `⭐ تحتاج: ${reward.starsNeeded} نجمة`]).replace(
        '🌸 تسجيل عناية',
        '🎁 مكافأة جديدة',
      ),
    );
  }
  return { ok: true as const, id: reward.id };
}

export async function getRewards(childId: string) {
  const [rewards, total_stars] = await Promise.all([
    prisma.reward.findMany({ where: { childId }, orderBy: { starsNeeded: 'asc' } }),
    prisma.journeyLog.count({ where: { childId } }),
  ]);
  return { ok: true as const, rewards, total_stars };
}

export async function deleteReward(id: string) {
  await prisma.reward.delete({ where: { id } });
  return { ok: true as const };
}

export async function claimReward(id: string) {
  const reward = await prisma.reward.update({ where: { id }, data: { status: 'claimed', claimedAt: new Date() } });
  await sendTelegram(
    buildEntryMessage('care', [`🎉 تم استلام مكافأة: ${reward.title}`, 'مبروك يا عروب! 🌸']).replace('🌸 تسجيل عناية', '🎉 استلام مكافأة'),
  );
  return { ok: true as const };
}

/** Promotes any pending reward whose star threshold has just been reached. */
export async function checkRewards(childId: string, totalStars: number) {
  const achieved = await prisma.reward.findMany({
    where: { childId, status: 'pending', starsNeeded: { lte: totalStars } },
  });
  for (const r of achieved) {
    await prisma.reward.update({ where: { id: r.id }, data: { status: 'available', achievedAt: new Date() } });
    await sendTelegram(
      buildEntryMessage('care', [`🌟 مكافأة متاحة الآن: ${r.title}`, 'يمكن للأهل استلامها من قسم الرحلة']).replace(
        '🌸 تسجيل عناية',
        '🌟 مكافأة متاحة',
      ),
    );
  }
}
