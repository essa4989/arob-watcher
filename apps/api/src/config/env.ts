import 'dotenv/config';

function required(name: string, fallback?: string): string {
  const v = process.env[name] ?? fallback;
  if (v === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return v;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 8080),
  databaseUrl: required('DATABASE_URL'),
  jwtSecret: required('JWT_SECRET', 'dev-only-insecure-secret'),
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN ?? '',
  defaultPins: {
    parent: process.env.DEFAULT_PIN_PARENT ?? '1234',
    nurse: process.env.DEFAULT_PIN_NURSE ?? '5678',
    doctor: process.env.DEFAULT_PIN_DOCTOR ?? '9999',
  },
  corsOrigins: (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
};
