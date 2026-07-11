import { Router } from 'express';
import { z } from 'zod';
import { env } from '../config/env';
import { saveSubscription, removeSubscription } from '../services/push.service';
import { asyncHandler } from '../middleware/errorHandler';

export const pushRouter = Router();

pushRouter.get('/vapid-public-key', (_req, res) => {
    res.json({ ok: true, publicKey: env.vapidPublicKey });
});

const subscribeSchema = z.object({
    endpoint: z.string().url(),
    keys: z.object({ p256dh: z.string(), auth: z.string() }),
    device: z.string().optional(),
});

pushRouter.post(
    '/subscribe',
    asyncHandler(async (req, res) => {
          const parsed = subscribeSchema.safeParse(req.body);
          if (!parsed.success) return res.status(400).json({ ok: false, error: 'بيانات اشتراك غير صحيحة' });
          await saveSubscription({ endpoint: parsed.data.endpoint, keys: parsed.data.keys }, parsed.data.device);
          res.json({ ok: true });
    }),
  );

pushRouter.post(
    '/unsubscribe',
    asyncHandler(async (req, res) => {
          const endpoint = (req.body as { endpoint?: string })?.endpoint;
          if (!endpoint) return res.status(400).json({ ok: false, error: 'endpoint مطلوب' });
          await removeSubscription(endpoint);
          res.json({ ok: true });
    }),
  );
