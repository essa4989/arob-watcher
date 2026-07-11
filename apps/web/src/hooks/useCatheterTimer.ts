import { useEffect, useState } from 'react';
import { useStatus } from './useStatus';
import { CATHETER_ALERT_LEVELS } from '@arob/shared';

const LS_KEY = 'aroob_last_catheter';

export function setLocalCatheterNow() {
  localStorage.setItem(LS_KEY, new Date().toISOString());
}

function readLocal(): string | null {
  return localStorage.getItem(LS_KEY);
}

/**
 * UI-first live timer: renders instantly from localStorage while the server call
 * for the new entry is still in flight, then reconciles with the server value on
 * the next poll using "latest wins". Do not turn this into a blocking await —
 * that was an intentional legacy decision (nurse UX speed) that we preserve.
 */
export function useCatheterTimer() {
  const { data: status } = useStatus();
  const [lastCatheter, setLastCatheter] = useState<string | null>(readLocal);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!status?.last_catheter) return;
    const local = readLocal();
    if (!local || new Date(status.last_catheter) >= new Date(local)) {
      localStorage.setItem(LS_KEY, status.last_catheter);
      setLastCatheter(status.last_catheter);
    }
  }, [status?.last_catheter]);

  const diffMinutes = lastCatheter ? Math.floor((now.getTime() - new Date(lastCatheter).getTime()) / 60000) : null;
  const diffSeconds = lastCatheter ? Math.floor((now.getTime() - new Date(lastCatheter).getTime()) / 1000) % 60 : null;

  let level = { level: 0, emoji: '⚪', labelAr: 'لا توجد بيانات بعد' } as (typeof CATHETER_ALERT_LEVELS)[number] | { level: 0; emoji: string; labelAr: string };
  if (diffMinutes !== null) {
    level = CATHETER_ALERT_LEVELS.find((l) => diffMinutes >= l.minMinutes) ?? { level: 0, emoji: '🟢', labelAr: 'ضمن الفترة الطبيعية' };
  }

  return { lastCatheter, diffMinutes, diffSeconds, level, status };
}
