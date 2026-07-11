import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

let cachedDefaultChildId: string | null = null;

/** Returns the single default child for the current deployment, creating one on first boot. */
export async function getDefaultChildId(): Promise<string> {
  if (cachedDefaultChildId) return cachedDefaultChildId;
  const existing = await prisma.child.findFirst({ where: { active: true }, orderBy: { createdAt: 'asc' } });
  if (existing) {
    cachedDefaultChildId = existing.id;
    return existing.id;
  }
  const created = await prisma.child.create({ data: { name: 'عروب' } });
  cachedDefaultChildId = created.id;
  return created.id;
}
