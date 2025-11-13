import { Injectable } from '@nestjs/common';
import { IPaymentGateway, PaymentProvider } from '../interfaces';
import { PaystackGateway } from './paystack.gateway';

@Injectable()
export class GatewayRegistryService {
  constructor(private readonly paystackGateway: PaystackGateway) {}

  getGateway(provider: PaymentProvider = 'PAYSTACK'): IPaymentGateway {
    switch (provider) {
      case 'PAYSTACK':
      default:
        return this.paystackGateway;
    }
  }
}
