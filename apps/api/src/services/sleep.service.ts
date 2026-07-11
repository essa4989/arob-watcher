import { getSetting, setSetting } from './settings.service';
import { logSettingChange } from './audit.service';
import { sendTelegram, buildEntryMessage } from './telegram.service';
import { isWithinTimeRange } from '../utils/time';
import { SLEEP_MODE_DEFAULT } from '@arob/shared';

export interface SleepConfig {
  enabled: boolean;
  from: string;
  to: string;
}

export async function getSleepConfig(childId: string): Promise<SleepConfig> {
  const [enabled, from, to] = await Promise.all([
    getSetting(childId, 'sleep_enabled'),
    getSetting(childId, 'sleep_from'),
    getSetting(childId, 'sleep_to'),
  ]);
  return {
    enabled: enabled === 'true' ? true : enabled === 'false' ? false : SLEEP_MODE_DEFAULT.enabled,
    from: from ?? SLEEP_MODE_DEFAULT.from,
    to: to ?? SLEEP_MODE_DEFAULT.to,
  };
}

export async function setSleepConfig(
  childId: string,
  cfg: Partial<SleepConfig>,
  device?: string,
): Promise<SleepConfig> {
  const current = await getSleepConfig(childId);
  const next: SleepConfig = { ...current, ...cfg };

  if (cfg.enabled !== undefined && cfg.enabled !== current.enabled) {
    await setSetting(childId, 'sleep_enabled', String(next.enabled));
    await logSettingChange('sleep_enabled', String(current.enabled), String(next.enabled), device);
  }
  if (cfg.from !== undefined && cfg.from !== current.from) {
    await setSetting(childId, 'sleep_from', next.from);
    await logSettingChange('sleep_from', current.from, next.from, device);
  }
  if (cfg.to !== undefined && cfg.to !== current.to) {
    await setSetting(childId, 'sleep_to', next.to);
    await logSettingChange('sleep_to', current.to, next.to, device);
  }

  await sendTelegram(
    buildEntryMessage('care', [
      `🌙 وضع النوم: ${next.enabled ? 'مفعّل' : 'متوقف'}`,
      `🕐 من ${next.from} إلى ${next.to}`,
    ]).replace('🌸 تسجيل عناية', '⚙️ تغيير إعدادات — وضع النوم'),
  );

  return next;
}

export async function isSleepTimeNow(childId: string): Promise<boolean> {
  const cfg = await getSleepConfig(childId);
  if (!cfg.enabled) return false;
  return isWithinTimeRange(new Date(), cfg.from, cfg.to);
}
