import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { authRouter } from './routes/auth.routes.js';
import { patientRouter } from './routes/patients.routes.js';
import { errorHandler } from './middleware/error.js';
import { dbHealth } from './services/db.js';
import { env } from './config/env.js';

export function createUbuzimaApi() {
  const app = express();
  const isDev = env.nodeEnv !== 'production';
  // Security middleware is preserved. In dev, CSP is configured to allow Vite (/@vite/client, React Refresh preamble)
  // and HMR websocket on the app origin (middleware mode uses the same host/port as the page). Production keeps Helmet defaults.
  app.use(helmet(isDev ? {
    contentSecurityPolicy: {
      useDefaults: false,
      directives: {
        defaultSrc: ["'self'"],
        baseUri: ["'self'"],
        fontSrc: ["'self'", 'https:', 'data:'],
        formAction: ["'self'"],
        frameAncestors: ["'self'"],
        imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
        objectSrc: ["'none'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        scriptSrcAttr: ["'none'"],
        styleSrc: ["'self'", 'https:', "'unsafe-inline'"],
        connectSrc: ["'self'", 'ws:', 'wss:', 'http:', 'https:'],
        workerSrc: ["'self'", 'blob:'],
      },
    },
    crossOriginEmbedderPolicy: false,
  } : {}));
  app.use(cors({ origin: env.appUrl, credentials: true }));
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());

  app.get('/health', async (_req, res) => {
    const db = await dbHealth();
    res.json({ ok: true, service: 'UBUZIMA HMS API', mode: env.nodeEnv, db, integrations: { nida: env.integrations.nidaMode, rssb: env.integrations.rssbMode, payments: 'simulated' } });
  });

  app.use('/auth', authRouter);
  app.use('/patients', patientRouter);
  app.use(errorHandler);
  return app;
}



