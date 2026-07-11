import webpush from 'web-push';
import { env } from '../config/env';
import { prisma } from '../db/prisma';

let configured = false;
function ensureConfigured() {
    if (configured || !env.vapidPublicKey || !env.vapidPrivateKey) return;
    webpush.setVapidDetails(env.vapidSubject, env.vapidPublicKey, env.vapidPrivateKey);
    configured = true;
}

export interface PushSubscriptionInput {
    endpoint: string;
    keys: { p256dh: string; auth: string };
}

export async function saveSubscription(sub: PushSubscriptionInput, device?: string) {
    await prisma.pushSubscription.upsert({
          where: { endpoint: sub.endpoint },
          update: { p256dh: sub.keys.p256dh, auth: sub.keys.auth, device },
          create: { endpoint: sub.endpoint, p256dh: sub.keys.p256dh, auth: sub.keys.auth, device },
    });
}

export async function removeSubscription(endpoint: string) {
    await prisma.pushSubscription.deleteMany({ where: { endpoint } });
}

function toNotificationText(text: string): { title: string; body: string } {
    const lines = text.split('\n').filter((l) => l && !l.startsWith('━') && !l.startsWith('🏥') && !l.startsWith('⏰'));
    return { title: lines[0] ?? 'منصة رعاية عروب', body: lines.slice(1).join(' — ') || lines[0] || '' };
}

export async function sendPushToAll(text: string, urgent = false): Promise<void> {
    ensureConfigured();
    if (!env.vapidPublicKey || !env.vapidPrivateKey) {
          console.warn('[push] VAPID keys not set — skipping web push');
          return;
    }
    const subs = await prisma.pushSubscription.findMany();
    if (subs.length === 0) return;

  const { title, body } = toNotificationText(text);
    const payload = JSON.stringify({
          title,
          body,
          urgent,
          vibrate: urgent ? [400, 200, 400, 200, 400, 200, 800] : [200, 100, 200],
    });

  for (const sub of subs) {
        try {
                await webpush.sendNotification({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }, payload);
        } catch (err) {
                const statusCode = (err as { statusCode?: number }).statusCode;
                if (statusCode === 404 || statusCode === 410) {
                          await prisma.pushSubscription.deleteMany({ where: { endpoint: sub.endpoint } });
                } else {
                          console.error('[push] send failed for device=' + (sub.device ?? sub.id), err);
                }
        }
  }
}
