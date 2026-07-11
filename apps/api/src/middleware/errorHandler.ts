import type { NextFunction, Request, Response } from 'express';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  console.error('[api] unhandled error', err);
  const message = err instanceof Error ? err.message : 'خطأ غير متوقع';
  res.status(500).json({ ok: false, error: message });
}

export function asyncHandler<T extends (req: Request, res: Response) => Promise<unknown>>(fn: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res).catch(next);
  };
}
