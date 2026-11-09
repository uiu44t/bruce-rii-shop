import type { Request, Response, NextFunction } from 'express';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  console.error('[ubuzima-api]', err);
  res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Unexpected server error.' });
}
