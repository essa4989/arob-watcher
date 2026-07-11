import { createApp } from './app';
import { env } from './config/env';
import { ensureDefaultCredentials } from './services/auth.service';
import { getDefaultChildId } from './db/prisma';
import { startJobs } from './jobs';

async function main() {
  await getDefaultChildId();
  await ensureDefaultCredentials();

  const app = createApp();
  app.listen(env.port, () => {
    console.log(`[api] listening on port ${env.port} (${env.nodeEnv})`);
  });

  startJobs();
}

main().catch((err) => {
  console.error('[api] fatal startup error', err);
  process.exit(1);
});
