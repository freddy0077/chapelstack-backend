export type PaymentProvider = 'PAYSTACK';

export interface InitiatePaymentInput {
  amount: number;
  currency: string;
  reference: string;
  metadata?: Record<string, any>;
}

export interface VerifyPaymentInput {
  reference: string;
}

export interface RefundPaymentInput {
  reference: string;
  amount?: number;
}

export interface PaymentStatus {
  reference: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
  provider: PaymentProvider;
}

export interface IPaymentGateway {
  initiate(input: InitiatePaymentInput): Promise<{ authorizationUrl?: string; reference: string }>;
  verify(input: VerifyPaymentInput): Promise<PaymentStatus>;
  refund(input: RefundPaymentInput): Promise<PaymentStatus>;
  getStatus(reference: string): Promise<PaymentStatus>;
}
