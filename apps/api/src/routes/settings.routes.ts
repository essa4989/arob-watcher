import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db/prisma';
import { sendTelegram, buildEntryMessage } from '../services/telegram.service';
import { requireCapability } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { APP_VERSION } from '../services/catheter.service';
import { env } from '../config/env';

export const settingsRouter = Router();

settingsRouter.post(
  '/telegram-test',
  requireCapability('can_settings'),
  asyncHandler(async (_req, res) => {
    const result = await sendTelegram(buildEntryMessage('care', ['📨 رسالة اختبار من المنصة']).replace('🌸 تسجيل عناية', '📨 اختبار الاتصال'));
    res.json(result);
  }),
);

settingsRouter.get(
  '/diagnostic',
  asyncHandler(async (_req, res) => {
    let dbOk = true;
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch {
      dbOk = false;
    }
    const chats = await prisma.telegramChat.count({ where: { enabled: true } });
    res.json({
      ok: true,
      version: APP_VERSION,
      database: dbOk ? 'connected' : 'error',
      telegram_configured: Boolean(env.telegramBotToken),
      telegram_chats: chats,
      server_time: new Date().toISOString(),
    });
  }),
);

settingsRouter.get(
  '/telegram-chats',
  requireCapability('can_settings'),
  asyncHandler(async (_req, res) => {
    res.json({ ok: true, chats: await prisma.telegramChat.findMany() });
  }),
);

const chatSchema = z.object({ chatId: z.string().min(1), label: z.string().optional() });

settingsRouter.post(
  '/telegram-chats',
  requireCapability('can_settings'),
  asyncHandler(async (req, res) => {
    const parsed = chatSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ ok: false, error: 'chatId مطلوب' });
    const chat = await prisma.telegramChat.upsert({
      where: { chatId: parsed.data.chatId },
      update: { label: parsed.data.label, enabled: true },
      create: { chatId: parsed.data.chatId, label: parsed.data.label },
    });
    res.json({ ok: true, chat });
  }),
);

settingsRouter.delete(
  '/telegram-chats/:id',
  requireCapability('can_settings'),
  asyncHandler(async (req, res) => {
    await prisma.telegramChat.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  }),
);
