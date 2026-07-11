import { prisma } from '../db/prisma';

/**
 * Durable per-child key/value settings. Mirrors the legacy PropertiesService
 * access pattern (getSetting/setSetting are the only two entry points) so
 * that state such as sleep-mode config and catheter-alert dedup cycles has
 * one obvious place to live.
 */
export async function getSetting(childId: string, key: string): Promise<string | null> {
  const row = await prisma.appSetting.findUnique({ where: { childId_key: { childId, key } } });
  return row?.value ?? null;
}

export async function setSetting(childId: string, key: string, value: string): Promise<void> {
  await prisma.appSetting.upsert({
    where: { childId_key: { childId, key } },
    update: { value },
    create: { childId, key, value },
  });
}

export async function deleteSetting(childId: string, key: string): Promise<void> {
  await prisma.appSetting.deleteMany({ where: { childId, key } });
}
