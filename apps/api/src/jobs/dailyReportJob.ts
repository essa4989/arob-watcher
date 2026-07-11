import { prisma } from '../db/prisma';
import { sendDailyReport } from '../services/stats.service';

/** Runs daily at 23:00 server time. */
export async function runDailyReport() {
  const children = await prisma.child.findMany({ where: { active: true } });
  for (const child of children) {
    try {
      await sendDailyReport(child.id);
    } catch (err) {
      console.error(`[jobs] daily report failed for child=${child.id}`, err);
    }
  }
}
