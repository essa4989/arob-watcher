import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { apiRouter } from './routes';
import { errorHandler } from './middleware/errorHandler';
import { env } from './config/env';

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: env.corsOrigins.length > 0 ? env.corsOrigins : true,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '2mb' }));

  app.get('/healthz', (_req, res) => res.json({ ok: true }));
  app.use('/api', apiRouter);

  // Serve the built React app (single Node service, same pattern as the legacy
  // single Apps Script Web App that served Page.html for every route).
  const webDist = path.resolve(__dirname, '../../web/dist');
  if (fs.existsSync(webDist)) {
    app.use(express.static(webDist));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) return next();
      res.sendFile(path.join(webDist, 'index.html'));
    });
  }

  app.use(errorHandler);
  return app;
}
