import { PrismaClient } from '@prisma/client';
import { env, isDbConfigured } from '../config/env.js';

let prisma: PrismaClient | null = null;

export function getPrisma(): PrismaClient {
  if (!isDbConfigured()) {
    throw new Error('DATABASE_URL is not configured. Set PostgreSQL connection to enable UBUZIMA persistence.');
  }
  if (!prisma) {
    prisma = new PrismaClient({
      datasources: { db: { url: env.databaseUrl } },
      log: env.nodeEnv === 'development' ? ['warn', 'error'] : ['error'],
    });
  }
  return prisma;
}

export async function dbHealth() {
  if (!isDbConfigured()) return { configured: false, ok: false };
  try {
    const client = getPrisma();
    await client.$queryRaw`SELECT 1`;
    return { configured: true, ok: true };
  } catch (error) {
    return { configured: true, ok: false, error: String(error) };
  }
}
