import { Router } from 'express';
import { z } from 'zod';
import { awardStar, getJourneyStatus, getHonorBoard, undoLastStar } from '../services/journey.service';
import { requireCapability } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import type { EntryType } from '@arob/shared';

export const journeyRouter = Router();

journeyRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    res.json(await getJourneyStatus(req.childId!));
  }),
);

journeyRouter.get(
  '/honor-board',
  asyncHandler(async (req, res) => {
    const rows = await getHonorBoard(req.childId!);
    res.json({ ok: true, entries: rows });
  }),
);

const awardSchema = z.object({ type: z.enum(['catheter', 'medication', 'check', 'fluid', 'care']), device: z.string().optional() });

journeyRouter.post(
  '/award',
  requireCapability('can_log'),
  asyncHandler(async (req, res) => {
    const parsed = awardSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ ok: false, error: 'بيانات غير صحيحة' });
    const result = await awardStar(req.childId!, parsed.data.type as EntryType, parsed.data.device);
    res.json(result);
  }),
);

journeyRouter.post(
  '/undo',
  requireCapability('can_log'),
  asyncHandler(async (req, res) => {
    const result = await undoLastStar(req.childId!, req.auth?.device);
    res.status(result.ok ? 200 : 400).json(result);
  }),
);
