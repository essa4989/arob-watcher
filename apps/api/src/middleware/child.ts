import type { NextFunction, Request, Response } from 'express';
import { getDefaultChildId } from '../db/prisma';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      childId?: string;
    }
  }
}

/** Resolves the active child for this request: explicit ?childId=/body.childId, else the default child. */
export async function attachChild(req: Request, _res: Response, next: NextFunction) {
  const explicit = (req.query.childId as string | undefined) ?? (req.body as { childId?: string } | undefined)?.childId;
  req.childId = explicit ?? (await getDefaultChildId());
  next();
}
