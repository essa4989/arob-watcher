import { prisma } from '../db/prisma';
import { getSetting, setSetting } from '../services/settings.service';
import { getLastCatheter } from '../services/catheter.service';
import { isSleepTimeNow } from '../services/sleep.service';
import { sendTelegram, buildEntryMessage } from '../services/telegram.service';
import { diffMinutes } from '../utils/time';
import { CATHETER_ALERT_LEVELS } from '@arob/shared';

/** Every 30 minutes: escalate the "catheter overdue" alert. Pauses during sleep mode
 *  (the periodic-only category — never applies to the immediate detectCatheterAlerts checks). */
export async function runCatheterAlertCheck() {
  const children = await prisma.child.findMany({ where: { active: true } });

  for (const child of children) {
    try {
      if (await isSleepTimeNow(child.id)) continue;

      const last = await getLastCatheter(child.id);
      if (!last) continue;
      const diff = diffMinutes(last.timestamp);

      const sentRaw = await getSetting(child.id, 'cath_sent_levels');
      const sent: number[] = sentRaw ? JSON.parse(sentRaw) : [];

      const ascending = [...CATHETER_ALERT_LEVELS].sort((a, b) => a.minMinutes - b.minMinutes);
      for (const lvl of ascending) {
        if (diff >= lvl.minMinutes && !sent.includes(lvl.level)) {
          await sendTelegram(
            buildEntryMessage('care', [
              `${lvl.emoji} ${lvl.labelAr}`,
              `⏱️ مرّ ${diff} دقيقة منذ آخر قسطرة`,
              lvl.level >= 4 ? '📞 يُرجى الاتصال بالطبيب إذا استمر التأخير' : '',
            ].filter(Boolean)).replace('🌸 تسجيل عناية', `${lvl.emoji} تنبيه تأخر القسطرة`),
          );
          sent.push(lvl.level);
        }
      }
      await setSetting(child.id, 'cath_sent_levels', JSON.stringify(sent));
    } catch (err) {
      console.error(`[jobs] catheter alert check failed for child=${child.id}`, err);
    }
  }
}
