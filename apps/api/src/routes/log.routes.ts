import { Router } from 'express';
import { z } from 'zod';
import { logEntry, getLogs, getAllLogs } from '../services/log.service';
import { deleteLastEntry } from '../services/undo.service';
import { requireCapability } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

export const logRouter = Router();

const baseSchema = z.object({ device: z.string().optional() });
const catheterSchema = baseSchema.extend({
  type: z.literal('catheter'),
  amount: z.number().positive(),
  color: z.string().optional(),
  smell: z.string().optional(),
  pain: z.string().optional(),
  notes: z.string().optional(),
});
const medicationSchema = baseSchema.extend({
  type: z.literal('medication'),
  med: z.string().min(1),
  dose: z.string().optional(),
  method: z.string().optional(),
  response: z.string().optional(),
  notes: z.string().optional(),
  medScheduleId: z.string().optional(),
  time: z.string().optional(),
});
const checkSchema = baseSchema.extend({
  type: z.literal('check'),
  temp: z.number().optional(),
  bp: z.string().optional(),
  pulse: z.number().optional(),
  spo2: z.number().optional(),
  skin: z.string().optional(),
  consciousness: z.string().optional(),
  position: z.string().optional(),
  notes: z.string().optional(),
});
const fluidSchema = baseSchema.extend({
  type: z.literal('fluid'),
  fluidType: z.string().min(1),
  amount: z.number().positive(),
  response: z.string().optional(),
  notes: z.string().optional(),
});
const careSchema = baseSchema.extend({
  type: z.literal('care'),
  care: z.string().min(1),
  response: z.string().optional(),
  notes: z.string().optional(),
});

const logSchema = z.discriminatedUnion('type', [catheterSchema, medicationSchema, checkSchema, fluidSchema, careSchema]);

logRouter.post(
  '/',
  requireCapability('can_log'),
  asyncHandler(async (req, res) => {
    const parsed = logSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ ok: false, error: parsed.error.errors[0]?.message ?? 'بيانات غير صحيحة' });
    if (parsed.data.type === 'check') {
      const c = parsed.data;
      if (c.temp === undefined && !c.bp && c.pulse === undefined && c.spo2 === undefined) {
        return res.status(400).json({ ok: false, error: 'قياس واحد على الأقل مطلوب' });
      }
    }
    const result = await logEntry(parsed.data, { childId: req.childId!, device: parsed.data.device, role: req.auth?.role });
    res.json(result);
  }),
);

logRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const limit = req.query.limit ? Number(req.query.limit) : 30;
    const rows = await getLogs(req.childId!, limit);
    res.json({ ok: true, logs: rows });
  }),
);

logRouter.get(
  '/all',
  requireCapability('can_export'),
  asyncHandler(async (req, res) => {
    const rows = await getAllLogs(req.childId!);
    res.json({ ok: true, ...rows });
  }),
);

logRouter.delete(
  '/last/:type',
  requireCapability('can_log'),
  asyncHandler(async (req, res) => {
    const type = req.params.type as 'catheter' | 'medication' | 'check' | 'fluid' | 'care';
    const result = await deleteLastEntry(req.childId!, type, req.auth?.device, req.auth?.role);
    res.status(result.ok ? 200 : 400).json(result);
  }),
);
