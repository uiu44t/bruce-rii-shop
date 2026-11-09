import { env } from '../config/env.js';

export type IntegrationResult<T> = {
  mode: 'simulated' | 'configured' | 'live';
  source: string;
  verified: boolean;
  message: string;
  data: T | null;
};

/** NIDA adapter: simulated by default. Live use requires official authorization/credentials and tested connection. */
export async function verifyNidaIdentity(nationalId: string): Promise<IntegrationResult<Record<string, unknown>>> {
  if (env.integrations.nidaMode !== 'live') {
    return { mode: 'simulated', source: 'NIDA_ADAPTER', verified: false, message: 'NIDA live integration not configured. Use authorized integration before production verification.', data: null };
  }
  return { mode: 'configured', source: 'NIDA_ADAPTER', verified: false, message: 'NIDA live adapter requires implementation with official API credentials.', data: null };
}

/** Insurance adapter placeholder (RSSB/RAMA/CBHI/MMI). */
export async function verifyInsurance(memberId: string): Promise<IntegrationResult<Record<string, unknown>>> {
  return { mode: env.integrations.rssbMode === 'live' ? 'configured' : 'simulated', source: 'INSURANCE_ADAPTER', verified: false, message: 'Insurance verification requires authorized provider integration.', data: { memberIdMasked: memberId ? `****${memberId.slice(-4)}` : null } };
}

/** Payment adapter placeholder. Never store PINs or sensitive payment credentials. */
export async function initiatePayment(input: { amount: number; currency: string; method: string; reference: string }): Promise<IntegrationResult<Record<string, unknown>>> {
  return { mode: 'simulated', source: 'PAYMENT_ADAPTER', verified: false, message: 'Payment initiation is simulated. Configure official MTN MoMo/Airtel/bank APIs before live use.', data: { ...input, status: 'PENDING', providerRef: null } };
}
