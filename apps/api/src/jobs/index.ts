import cron from 'node-cron';
import { runCatheterAlertCheck } from './catheterAlertJob';
import { runMedicationAlertCheck } from './medicationAlertJob';
import { runDailyReport } from './dailyReportJob';

/** Registers the 3 recurring jobs that replace the legacy Apps Script time-driven triggers. */
export function startJobs() {
  cron.schedule('*/30 * * * *', () => void runCatheterAlertCheck());
  cron.schedule('*/30 * * * *', () => void runMedicationAlertCheck());
  cron.schedule('0 23 * * *', () => void runDailyReport());
  console.log('[jobs] scheduled: catheter alert (30m), medication alert (30m), daily report (23:00 server time)');
}
