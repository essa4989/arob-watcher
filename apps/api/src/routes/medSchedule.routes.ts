import { Router } from 'express';
import { z } from 'zod';
import { saveMedSchedule, getMedSchedule, deleteMedSchedule, getUpcomingMedToday, getMissedMedsToday } from '../services/medSchedule.service';
import { requireCapability } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

export const medScheduleRouter = Router();

medScheduleRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    res.json(await getMedSchedule(req.childId!));
  }),
);

medScheduleRouter.get(
  '/upcoming',
  asyncHandler(async (req, res) => {
    res.json({ ok: true, upcoming: await getUpcomingMedToday(req.childId!) });
  }),
);

medScheduleRouter.get(
  '/missed',
  asyncHandler(async (req, res) => {
    res.json({ ok: true, missed: await getMissedMedsToday(req.childId!) });
  }),
);

const saveSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  dose: z.string().optional(),
  method: z.string().optional(),
  times: z.array(z.string()),
  frequency: z.string().optional(),
  days: z.array(z.string()).default([]),
  startDate: z.string().optional(),
  notes: z.string().optional(),
});

medScheduleRouter.post(
  '/',
  requireCapability('can_settings'),
  asyncHandler(async (req, res) => {
    const parsed = saveSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ ok: false, error: 'بيانات غير صحيحة' });
    res.json(await saveMedSchedule(req.childId!, parsed.data));
  }),
);

medScheduleRouter.delete(
  '/:id',
  requireCapability('can_settings'),
  asyncHandler(async (req, res) => {
    res.json(await deleteMedSchedule(req.params.id));
  }),
);
