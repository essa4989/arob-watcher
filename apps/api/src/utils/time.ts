/** yyyy-MM-dd in server local time. */
export function dateStr(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** HH:mm in server local time. */
export function timeStr(d: Date = new Date()): string {
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

export function timeToMins(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

export function diffMinutes(from: Date, to: Date = new Date()): number {
  return Math.floor((to.getTime() - from.getTime()) / 60000);
}

/** Handles ranges that wrap past midnight, e.g. 23:00 -> 07:00. */
export function isWithinTimeRange(now: Date, from: string, to: string): boolean {
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const fromMins = timeToMins(from);
  const toMins = timeToMins(to);
  if (fromMins === toMins) return false;
  if (fromMins < toMins) {
    return nowMins >= fromMins && nowMins < toMins;
  }
  return nowMins >= fromMins || nowMins < toMins;
}
