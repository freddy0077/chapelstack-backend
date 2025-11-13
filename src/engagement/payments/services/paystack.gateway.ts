import { Injectable, BadRequestException } from '@nestjs/common';
import { IPaymentGateway, InitiatePaymentInput, VerifyPaymentInput, RefundPaymentInput, PaymentStatus } from '../../payments/interfaces';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class PaystackGateway implements IPaymentGateway {
  private readonly baseUrl = 'https://api.paystack.co';

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  async initiate(input: InitiatePaymentInput): Promise<{ authorizationUrl?: string; reference: string }> {
    const email = (input.metadata && (input.metadata.email || input.metadata.payerEmail)) as string | undefined;
    if (!email) {
      throw new BadRequestException('Paystack initiate requires payer email in metadata.email');
    }
    const amount = input.amount;
    const currency = input.currency || 'NGN';

    const secret = this.config.get<string>('PAYSTACK_SECRET_KEY');
    if (!secret) throw new BadRequestException('Missing PAYSTACK_SECRET_KEY');

    const resp = await firstValueFrom(
      this.http.post(
        `${this.baseUrl}/transaction/initialize`,
        {
          email,
          amount,
          currency,
          reference: input.reference,
          metadata: input.metadata,
        },
        { headers: { Authorization: `Bearer ${secret}` } },
      ),
    ).catch((e) => {
      throw new BadRequestException(e?.response?.data || e.message);
    });
    const data = resp.data;

    return {
      authorizationUrl: data?.authorization_url,
      reference: data?.reference || input.reference,
    };
  }

  async verify(input: VerifyPaymentInput): Promise<PaymentStatus> {
    const secret = this.config.get<string>('PAYSTACK_SECRET_KEY');
    if (!secret) throw new BadRequestException('Missing PAYSTACK_SECRET_KEY');

    const verifyResp = await firstValueFrom(
      this.http.get(`${this.baseUrl}/transaction/verify/${input.reference}` , {
        headers: { Authorization: `Bearer ${secret}` },
      }),
    ).catch((e) => { throw new BadRequestException(e?.response?.data || e.message); });
    const statusRaw = verifyResp?.data?.data?.status as string | undefined;
    let status: PaymentStatus['status'] = 'PENDING';
    if (statusRaw === 'success') status = 'SUCCESS';
    else if (statusRaw === 'failed') status = 'FAILED';

    return {
      reference: input.reference,
      status,
      provider: 'PAYSTACK',
    };
  }

  async refund(_input: RefundPaymentInput): Promise<PaymentStatus> {
    // Not implemented in current PaystackService. Expose as unsupported for now.
    throw new BadRequestException('Refund not supported via Paystack gateway yet');
  }

  async getStatus(reference: string): Promise<PaymentStatus> {
    const secret = this.config.get<string>('PAYSTACK_SECRET_KEY');
    if (!secret) throw new BadRequestException('Missing PAYSTACK_SECRET_KEY');

    const verifyResp2 = await firstValueFrom(
      this.http.get(`${this.baseUrl}/transaction/verify/${reference}`, {
        headers: { Authorization: `Bearer ${secret}` },
      }),
    ).catch((e) => { throw new BadRequestException(e?.response?.data || e.message); });
    const statusRaw = verifyResp2?.data?.data?.status as string | undefined;
    let status: PaymentStatus['status'] = 'PENDING';
    if (statusRaw === 'success') status = 'SUCCESS';
    else if (statusRaw === 'failed') status = 'FAILED';

    return {
      reference,
      status,
      provider: 'PAYSTACK',
    };
  }
}
