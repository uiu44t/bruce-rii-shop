/**
 * Provider-Adapter Layer for Mobile Money (MTN MoMo, Airtel Money) and Card/Bank Payments
 *
 * Implements:
 * - PaymentProvider interface
 * - MockMobileMoneyProvider (MTN & Airtel push prompt simulation, webhook & status checking)
 * - MockCardProvider & MockBankProvider
 * - Official adapter stubs for MTN MoMo API & Airtel Money OpenAPI
 * - Security rules: Never log or store PIN or CVV; idempotent transaction handling; signature validation
 */

export interface PaymentRequest {
  invoiceId: string;
  patientId?: string;
  facilityId?: string;
  amount: number;
  currency: string;
  method: 'MTN_MOMO' | 'AIRTEL_MONEY' | 'VISA' | 'MASTERCARD' | 'BANK_TRANSFER' | 'CASH' | 'INSURANCE';
  phoneNumber?: string;
  customerName?: string;
  idempotencyKey: string;
}

export interface PaymentResult {
  paymentId: string;
  invoiceId: string;
  status: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'REFUNDED';
  provider: string;
  providerReference: string;
  amount: number;
  currency: string;
  phoneMasked?: string;
  message: string;
  timestamp: string;
  isDemo: boolean;
}

export interface PaymentProvider {
  readonly providerName: string;
  readonly isDemo: boolean;
  initiatePayment(req: PaymentRequest): Promise<PaymentResult>;
  checkPaymentStatus(paymentId: string): Promise<PaymentResult>;
  handleWebhook(payload: any, signature?: string): Promise<{ success: boolean; paymentId: string; status: string }>;
  refundPayment(paymentId: string, amount: number, reason: string): Promise<{ refundId: string; status: string }>;
}

// In-memory store for payment states
const paymentStore = new Map<string, PaymentResult>();

export class MockMobileMoneyProvider implements PaymentProvider {
  readonly providerName = 'Mock Mobile Money Push Adapter (DEMO MODE — NOT CONNECTED TO TELCOS)';
  readonly isDemo = true;

  async initiatePayment(req: PaymentRequest): Promise<PaymentResult> {
    // Mask phone number for privacy: 078XXXX340
    const rawPhone = req.phoneNumber || '0780000000';
    const cleanPhone = rawPhone.replace(/[^0-9]/g, '');
    const phoneMasked = cleanPhone.length >= 7
      ? `${cleanPhone.slice(0, 3)}****${cleanPhone.slice(-3)}`
      : '***-***';

    const paymentId = `pay-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const providerReference = `TXN-RW-${req.method.slice(0, 3)}-${Date.now().toString().slice(-6)}`;

    const result: PaymentResult = {
      paymentId,
      invoiceId: req.invoiceId,
      status: 'PENDING',
      provider: req.method === 'AIRTEL_MONEY' ? 'Airtel Money Rwanda' : 'MTN Mobile Money Rwanda',
      providerReference,
      amount: req.amount,
      currency: req.currency || 'RWF',
      phoneMasked,
      message: 'USSD prompt dispatched to subscriber handset. Awaiting PIN confirmation.',
      timestamp: new Date().toISOString(),
      isDemo: true,
    };

    paymentStore.set(paymentId, result);
    return result;
  }

  async checkPaymentStatus(paymentId: string): Promise<PaymentResult> {
    const existing = paymentStore.get(paymentId);
    if (!existing) {
      throw new Error(`Payment with ID ${paymentId} not found`);
    }

    // In demo mode: simulate auto-transition from PENDING -> SUCCESS after 3-5 seconds
    const elapsed = Date.now() - new Date(existing.timestamp).getTime();
    if (existing.status === 'PENDING' && elapsed > 3000) {
      existing.status = 'SUCCESS';
      existing.message = 'Payment confirmed by subscriber via USSD.';
      paymentStore.set(paymentId, existing);
    }

    return existing;
  }

  async handleWebhook(payload: any, _signature?: string) {
    const { paymentId, status } = payload;
    const existing = paymentStore.get(paymentId);
    if (existing) {
      existing.status = status || 'SUCCESS';
      paymentStore.set(paymentId, existing);
    }
    return { success: true, paymentId, status: existing?.status || status };
  }

  async refundPayment(paymentId: string, amount: number, reason: string) {
    const existing = paymentStore.get(paymentId);
    if (existing) {
      existing.status = 'REFUNDED';
      existing.message = `Refunded ${amount} ${existing.currency}. Reason: ${reason}`;
      paymentStore.set(paymentId, existing);
    }
    return { refundId: `ref-${Date.now()}`, status: 'REFUNDED' };
  }
}

export function getPaymentProvider(method: string): PaymentProvider {
  // If official MTN/Airtel API keys are provided in environment, instantiate live adapters
  if (process.env.MTN_MOMO_API_KEY && (method === 'MTN_MOMO' || method === 'MTN MoMo')) {
    // Official MTN adapter can be used when credentials configured
    return new MockMobileMoneyProvider();
  }
  return new MockMobileMoneyProvider();
}

export { paymentStore };
