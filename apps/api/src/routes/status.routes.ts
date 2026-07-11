import { Router } from 'express';
import { getStatus } from '../services/catheter.service';
import { getSleepConfig, setSleepConfig } from '../services/sleep.service';
import { requireCapability } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

export const statusRouter = Router();

statusRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const status = await getStatus(req.childId!);
    res.json(status);
  }),
);

statusRouter.get(
  '/sleep',
  asyncHandler(async (req, res) => {
    const cfg = await getSleepConfig(req.childId!);
    res.json({ ok: true, ...cfg, is_now: cfg.enabled });
  }),
);

statusRouter.post(
  '/sleep',
  requireCapability('can_settings'),
  asyncHandler(async (req, res) => {
    const { enabled, from, to } = req.body as { enabled?: boolean; from?: string; to?: string };
    const cfg = await setSleepConfig(req.childId!, { enabled, from, to }, req.auth?.device);
    res.json({ ok: true, ...cfg });
  }),
);

statusRouter.get(
  '/ping',
  (_req, res) => res.json({ ok: true, pong: true, time: new Date().toISOString() }),
);
