import { Injectable } from '@nestjs/common';
import { InitiatePaymentInput, VerifyPaymentInput, RefundPaymentInput, PaymentStatus } from './interfaces';
import { GatewayRegistryService } from './services/gateway-registry.service';

@Injectable()
export class PaymentsFacade {
  constructor(private readonly registry: GatewayRegistryService) {}

  async initiate(input: InitiatePaymentInput) {
    const gateway = this.registry.getGateway('PAYSTACK');
    return gateway.initiate(input);
  }

  async verify(input: VerifyPaymentInput): Promise<PaymentStatus> {
    const gateway = this.registry.getGateway('PAYSTACK');
    return gateway.verify(input);
  }

  async refund(input: RefundPaymentInput): Promise<PaymentStatus> {
    const gateway = this.registry.getGateway('PAYSTACK');
    return gateway.refund(input);
  }

  async getStatus(reference: string): Promise<PaymentStatus> {
    const gateway = this.registry.getGateway('PAYSTACK');
    return gateway.getStatus(reference);
  }
}
