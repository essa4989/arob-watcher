import { prisma } from '../db/prisma';
import { getMissedMedsToday } from '../services/medSchedule.service';
import { getSetting, setSetting } from '../services/settings.service';
import { isSleepTimeNow } from '../services/sleep.service';
import { sendTelegram, buildEntryMessage } from '../services/telegram.service';
import { dateStr } from '../utils/time';

/** Every 30 minutes: notify about missed scheduled doses. Pauses during sleep mode. */
export async function runMedicationAlertCheck() {
  const children = await prisma.child.findMany({ where: { active: true } });

  for (const child of children) {
    try {
      if (await isSleepTimeNow(child.id)) continue;

      const missed = await getMissedMedsToday(child.id);
      if (missed.length === 0) continue;

      const notifiedKey = 'med_missed_notified';
      const notifiedRaw = await getSetting(child.id, notifiedKey);
      const notified: string[] = notifiedRaw ? JSON.parse(notifiedRaw) : [];
      const today = dateStr();

      const toNotify = missed.filter((m) => !notified.includes(`${m.scheduleId}_${today}_${m.time}`));
      if (toNotify.length === 0) continue;

      await sendTelegram(
        buildEntryMessage(
          'care',
          toNotify.map((m) => `💊 جرعة فائتة: ${m.name} — الموعد ${m.time}`),
        ).replace('🌸 تسجيل عناية', '⚠️ دواء فائت'),
      );

      const updated = [...notified, ...toNotify.map((m) => `${m.scheduleId}_${today}_${m.time}`)];
      await setSetting(child.id, notifiedKey, JSON.stringify(updated));
    } catch (err) {
      console.error(`[jobs] medication alert check failed for child=${child.id}`, err);
    }
  }
}
