import type { NextFunction, Request, Response } from 'express';
import { verifySession, getCapabilities } from '../services/auth.service';
import type { Role } from '@arob/shared';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auth?: { role: Role; device: string; token: string };
    }
  }
}

/** Reads the session token if present but does not require one — most reads are open to all roles. */
export async function attachSession(req: Request, _res: Response, next: NextFunction) {
  const token = req.header('x-session-token') ?? (req.body as { token?: string } | undefined)?.token;
  const session = await verifySession(token);
  if (session) {
    req.auth = { role: session.role as Role, device: session.device, token: session.token };
  }
  next();
}

/** Rejects the request unless a valid session grants `capability`. This is the server-side
 *  enforcement the legacy system was missing (Known Issue #3 — UI-only permissions). */
export function requireCapability(capability: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.auth) {
      return res.status(401).json({ ok: false, error: 'تسجيل الدخول مطلوب' });
    }
    const caps = getCapabilities(req.auth.role);
    if (!caps[capability]) {
      return res.status(403).json({ ok: false, error: 'غير مصرح لهذا الدور' });
    }
    next();
  };
}
