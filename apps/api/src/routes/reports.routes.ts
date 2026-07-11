import { Router } from 'express';
import { getStats, sendDailyReport, type Period } from '../services/stats.service';
import { smartSummary, detectPatterns } from '../services/smartAnalysis.service';
import { asyncHandler } from '../middleware/errorHandler';

export const reportsRouter = Router();

reportsRouter.get(
  '/stats',
  asyncHandler(async (req, res) => {
    const period = (req.query.period as Period) ?? 'daily';
    res.json(await getStats(req.childId!, period));
  }),
);

reportsRouter.post(
  '/send',
  asyncHandler(async (req, res) => {
    res.json({ ok: true, stats: await sendDailyReport(req.childId!) });
  }),
);

reportsRouter.get(
  '/smart-summary',
  asyncHandler(async (req, res) => {
    const period = (req.query.period as 'daily' | 'weekly') ?? 'daily';
    res.json(await smartSummary(req.childId!, period));
  }),
);

reportsRouter.get(
  '/patterns',
  asyncHandler(async (req, res) => {
    const days = req.query.days ? Number(req.query.days) : 7;
    res.json(await detectPatterns(req.childId!, days));
  }),
);
