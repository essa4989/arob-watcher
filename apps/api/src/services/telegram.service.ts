import { env } from '../config/env';
import { prisma } from '../db/prisma';

const TYPE_TITLES: Record<string, string> = {
  catheter: '💗 تسجيل قسطرة',
  medication: '💊 تسجيل دواء',
  check: '🩺 تسجيل فحص',
  fluid: '💧 تسجيل سوائل',
  care: '🌸 تسجيل عناية',
};

function header(title: string): string {
  return `🏥 نظام متابعة عروب\n━━━━━━━━━━━━━━━━\n${title}\n`;
}

function footer(d: Date = new Date()): string {
  const time = d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: false });
  const date = `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
  return `\n⏰ ${time} — ${date}`;
}

export function buildEntryMessage(type: keyof typeof TYPE_TITLES, lines: string[]): string {
  return header(TYPE_TITLES[type] ?? type) + '\n' + lines.join('\n') + footer();
}

/** Sends `text` (HTML parse mode) to every enabled Telegram chat. Never throws — logs failures per chat. */
export async function sendTelegram(text: string): Promise<{ ok: boolean; results: Array<{ chatId: string; ok: boolean; error?: string }> }> {
  if (!env.telegramBotToken) {
    console.warn('[telegram] TELEGRAM_BOT_TOKEN not set — skipping send');
    return { ok: false, results: [] };
  }
  const chats = await prisma.telegramChat.findMany({ where: { enabled: true } });
  const results: Array<{ chatId: string; ok: boolean; error?: string }> = [];

  for (const chat of chats) {
    try {
      const res = await fetch(`https://api.telegram.org/bot${env.telegramBotToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chat.chatId, text, parse_mode: 'HTML' }),
      });
      const body = await res.json().catch(() => ({}));
      const ok = res.ok && (body as { ok?: boolean }).ok !== false;
      results.push({ chatId: chat.chatId, ok, error: ok ? undefined : JSON.stringify(body) });
      if (ok) {
        console.log(`[telegram] chat=${chat.chatId} ok=true`);
      } else {
        console.error(`[telegram] chat=${chat.chatId} ok=false reason=${JSON.stringify(body)}`);
      }
    } catch (err) {
      results.push({ chatId: chat.chatId, ok: false, error: String(err) });
      console.error(`[telegram] chat=${chat.chatId} failed`, err);
    }
  }
  if (chats.length === 0) {
    console.warn('[telegram] no enabled chats configured — nothing was sent');
  }
  return { ok: results.length > 0 && results.some((r) => r.ok), results };
}
