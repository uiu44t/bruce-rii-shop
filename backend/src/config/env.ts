import 'dotenv/config';

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 3000),
  appUrl: process.env.APP_URL || 'http://localhost:3000',
  databaseUrl: process.env.DATABASE_URL || '',
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || '',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || '',
  jwtAccessTtl: process.env.JWT_ACCESS_TTL || '15m',
  jwtRefreshTtl: process.env.JWT_REFRESH_TTL || '7d',
  redisUrl: process.env.REDIS_URL || '',
  integrations: {
    nidaMode: process.env.NIDA_INTEGRATION_MODE || 'simulated',
    rssbMode: process.env.RSSB_INTEGRATION_MODE || 'simulated',
    mtnMode: process.env.MTN_MOMO_INTEGRATION_MODE || 'simulated',
    airtelMode: process.env.AIRTEL_MONEY_INTEGRATION_MODE || 'simulated',
  },
};

export function isDbConfigured() {
  return /^postgres(ql)?:\/\//.test(env.databaseUrl);
}

export function assertJwtConfigured() {
  if (!env.jwtAccessSecret || !env.jwtRefreshSecret) {
    throw new Error('JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be configured.');
  }
}
