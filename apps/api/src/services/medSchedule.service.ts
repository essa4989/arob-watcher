import { prisma } from '../db/prisma';
import { dateStr, timeToMins } from '../utils/time';
import { MED_MISSED_AFTER_MIN } from '@arob/shared';

export interface MedScheduleInput {
  id?: string;
  name: string;
  dose?: string;
  method?: string;
  times: string[]; // "HH:mm"[]
  frequency?: string;
  days: string[]; // JS weekday numbers as strings, [] = every day
  startDate?: string;
  notes?: string;
}

export async function saveMedSchedule(childId: string, input: MedScheduleInput) {
  const data = {
    childId,
    name: input.name,
    dose: input.dose,
    method: input.method,
    times: input.times,
    frequency: input.frequency,
    days: input.days,
    startDate: input.startDate,
    notes: input.notes,
  };
  const row = input.id
    ? await prisma.medSchedule.update({ where: { id: input.id }, data })
    : await prisma.medSchedule.create({ data });
  return { ok: true as const, id: row.id };
}

export async function getMedSchedule(childId: string) {
  const rows = await prisma.medSchedule.findMany({ where: { childId, active: true }, orderBy: { createdAt: 'asc' } });
  return { ok: true as const, schedules: rows };
}

export async function deleteMedSchedule(id: string) {
  await prisma.medSchedule.update({ where: { id }, data: { active: false } });
  return { ok: true as const };
}

export function isMedDueToday(days: unknown): boolean {
  const list = Array.isArray(days) ? (days as string[]) : [];
  if (list.length === 0) return true;
  return list.includes(String(new Date().getDay()));
}

export async function getUpcomingMedToday(childId: string) {
  const schedules = await prisma.medSchedule.findMany({ where: { childId, active: true } });
  const nowMins = new Date().getHours() * 60 + new Date().getMinutes();
  const upcoming: Array<{ scheduleId: string; name: string; time: string }> = [];
  for (const s of schedules) {
    if (!isMedDueToday(s.days)) continue;
    for (const t of s.times as string[]) {
      if (timeToMins(t) >= nowMins) {
        upcoming.push({ scheduleId: s.id, name: s.name, time: t });
      }
    }
  }
  return upcoming.sort((a, b) => timeToMins(a.time) - timeToMins(b.time));
}

export async function getMissedMedsToday(childId: string) {
  const schedules = await prisma.medSchedule.findMany({ where: { childId, active: true } });
  const today = dateStr();
  const nowMins = new Date().getHours() * 60 + new Date().getMinutes();
  const missed: Array<{ scheduleId: string; name: string; time: string }> = [];

  for (const s of schedules) {
    if (!isMedDueToday(s.days)) continue;
    for (const t of s.times as string[]) {
      const dueMins = timeToMins(t);
      if (nowMins - dueMins < MED_MISSED_AFTER_MIN) continue; // not due yet or within grace window
      const mark = await prisma.medGivenMark.findUnique({
        where: { medScheduleId_date_time: { medScheduleId: s.id, date: today, time: t } },
      });
      if (!mark) missed.push({ scheduleId: s.id, name: s.name, time: t });
    }
  }
  return missed;
}
