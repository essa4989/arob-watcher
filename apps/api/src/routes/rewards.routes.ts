import { Router } from 'express';
import { z } from 'zod';
import { saveReward, getRewards, deleteReward, claimReward } from '../services/reward.service';
import { requireCapability } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

export const rewardsRouter = Router();

rewardsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    res.json(await getRewards(req.childId!));
  }),
);

const saveSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  starsNeeded: z.number().positive(),
});

rewardsRouter.post(
  '/',
  requireCapability('can_rewards'),
  asyncHandler(async (req, res) => {
    const parsed = saveSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ ok: false, error: 'العنوان مطلوب' });
    res.json(await saveReward(req.childId!, parsed.data));
  }),
);

rewardsRouter.delete(
  '/:id',
  requireCapability('can_rewards'),
  asyncHandler(async (req, res) => {
    res.json(await deleteReward(req.params.id));
  }),
);

rewardsRouter.post(
  '/:id/claim',
  requireCapability('can_rewards'),
  asyncHandler(async (req, res) => {
    res.json(await claimReward(req.params.id));
  }),
);
