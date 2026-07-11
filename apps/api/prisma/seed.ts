import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const child = await prisma.child.upsert({
    where: { id: 'seed-aroob' },
    update: {},
    create: { id: 'seed-aroob', name: 'عروب' },
  });
  console.log(`Child ready: ${child.name} (${child.id})`);

  const defaults: Array<{ role: 'parent' | 'nurse' | 'doctor'; pin: string }> = [
    { role: 'parent', pin: process.env.DEFAULT_PIN_PARENT ?? '1234' },
    { role: 'nurse', pin: process.env.DEFAULT_PIN_NURSE ?? '5678' },
    { role: 'doctor', pin: process.env.DEFAULT_PIN_DOCTOR ?? '9999' },
  ];
  for (const d of defaults) {
    const pinHash = await bcrypt.hash(d.pin, 10);
    await prisma.credential.upsert({ where: { role: d.role }, update: {}, create: { role: d.role, pinHash } });
  }
  console.log('Default PINs seeded (change them from Settings immediately).');

  const seedChats = [
    { chatId: '177072554', label: 'عيسى' },
    { chatId: '1609089669', label: 'مستخدم ثانٍ' },
    { chatId: '-1003704804541', label: 'مجموعة العائلة' },
  ];
  for (const c of seedChats) {
    await prisma.telegramChat.upsert({ where: { chatId: c.chatId }, update: {}, create: c });
  }
  console.log('Telegram chats seeded from the legacy configuration.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
