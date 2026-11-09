import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { login, register, refresh } from '../services/auth.service.js';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';
import { isDbConfigured } from '../config/env.js';

export const authRouter = Router();
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true });
const registerLimiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 20, standardHeaders: true });

authRouter.post('/login', limiter, async (req, res, next) => {
  try {
    if (!isDbConfigured()) return res.status(503).json({ error: 'DB_NOT_CONFIGURED', message: 'PostgreSQL is not configured. Set DATABASE_URL and run Prisma migrations for UBUZIMA auth.' });
    const result = await login(req.body);
    res.json(result);
  } catch (e) { next(e); }
});

authRouter.post('/register', registerLimiter, async (req, res, next) => {
  try {
    if (!isDbConfigured()) return res.status(503).json({ error: 'DB_NOT_CONFIGURED', message: 'PostgreSQL is not configured. Set DATABASE_URL, run migrations and RBAC seed before creating users.' });
    const result = await register(req.body);
    res.status(201).json(result);
  } catch (e) { next(e); }
});

authRouter.post('/refresh', limiter, async (req, res, next) => {
  try {
    const token = req.body?.refreshToken || req.cookies?.refreshToken;
    if (!token) return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'refreshToken is required.' });
    res.json(await refresh(token));
  } catch (e) { next(e); }
});

authRouter.get('/me', requireAuth, (req: AuthRequest, res) => {
  res.json({ user: req.user });
});
