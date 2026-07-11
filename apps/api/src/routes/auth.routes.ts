import { Router } from 'express';
import { z } from 'zod';
import { verifyPin, changePin } from '../services/auth.service';
import { getAuditLog } from '../services/audit.service';
import { requireCapability } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

export const authRouter = Router();

const loginSchema = z.object({ pin: z.string().min(1), device: z.string().default('web') });

authRouter.post(
  '/login',
  asyncHandler(async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ ok: false, error: 'بيانات غير صحيحة' });
    const result = await verifyPin(parsed.data.pin, parsed.data.device);
    res.status(result.ok ? 200 : 401).json(result);
  }),
);

authRouter.get(
  '/session',
  asyncHandler(async (req, res) => {
    if (!req.auth) return res.status(401).json({ ok: false, error: 'لا توجد جلسة' });
    res.json({ ok: true, role: req.auth.role, device: req.auth.device });
  }),
);

const changePinSchema = z.object({
  token: z.string(),
  targetRole: z.enum(['parent', 'nurse', 'doctor']),
  newPin: z.string().regex(/^\d{4,8}$/),
});

authRouter.post(
  '/change-pin',
  requireCapability('can_change_pin'),
  asyncHandler(async (req, res) => {
    const parsed = changePinSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ ok: false, error: 'بيانات غير صحيحة' });
    const result = await changePin(parsed.data.token, parsed.data.targetRole, parsed.data.newPin, req.auth?.device);
    res.status(result.ok ? 200 : 403).json(result);
  }),
);

authRouter.get(
  '/audit-log',
  requireCapability('can_settings'),
  asyncHandler(async (req, res) => {
    if (req.auth?.role !== 'parent') return res.status(403).json({ ok: false, error: 'الأهل فقط' });
    const rows = await getAuditLog(50);
    res.json({ ok: true, entries: rows });
  }),
);
