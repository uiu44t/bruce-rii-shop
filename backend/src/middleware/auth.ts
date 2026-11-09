import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, type AuthUser } from '../services/auth.service.js';

export type AuthRequest = Request & { user?: AuthUser };

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Bearer token required.' });
  }
  try {
    const payload = verifyAccessToken(auth.slice(7));
    req.user = { id: payload.sub, email: (payload as any).email, fullName: (payload as any).fullName, role: payload.role, permissions: payload.permissions || [], facilityId: payload.facilityId };
    next();
  } catch {
    return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Invalid or expired token.' });
  }
}

export function requirePermission(permission: string) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const perms = req.user?.permissions || [];
    if (req.user?.role === 'SUPER_ADMIN' || perms.includes(permission) || perms.includes('*')) return next();
    return res.status(403).json({ error: 'FORBIDDEN', message: `Missing permission: ${permission}` });
  };
}
