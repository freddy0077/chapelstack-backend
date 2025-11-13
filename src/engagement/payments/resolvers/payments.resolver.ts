import { Resolver, Mutation, Query, Args, InputType, Field, ObjectType } from '@nestjs/graphql';
import { PaymentsFacade } from '../../payments/payments.facade';

@InputType()
class InitiatePaymentInputGQL {
  @Field() amount!: number;
  @Field({ nullable: true }) currency?: string;
  @Field() reference!: string;
  @Field({ nullable: true }) metadataJson?: string; // JSON string
}

@InputType()
class VerifyPaymentInputGQL {
  @Field() reference!: string;
}

@ObjectType()
class InitiatePaymentResult {
  @Field({ nullable: true }) authorizationUrl?: string;
  @Field() reference!: string;
}

@ObjectType()
class PaymentStatusResult {
  @Field() reference!: string;
  @Field() status!: string;
  @Field() provider!: string;
}

@Resolver()
export class PaymentsResolver {
  constructor(private readonly payments: PaymentsFacade) {}

  @Mutation(() => InitiatePaymentResult)
  async initiatePayment(@Args('input') input: InitiatePaymentInputGQL): Promise<InitiatePaymentResult> {
    const metadata = input.metadataJson ? JSON.parse(input.metadataJson) : {};
    const res = await this.payments.initiate({
      amount: input.amount,
      currency: input.currency || 'NGN',
      reference: input.reference,
      metadata,
    });
    return { authorizationUrl: res.authorizationUrl, reference: res.reference };
  }

  @Mutation(() => PaymentStatusResult)
  async verifyPayment(@Args('input') input: VerifyPaymentInputGQL): Promise<PaymentStatusResult> {
    const res = await this.payments.verify({ reference: input.reference });
    return { reference: res.reference, status: res.status, provider: res.provider };
  }

  @Query(() => PaymentStatusResult)
  async paymentStatus(@Args('reference') reference: string): Promise<PaymentStatusResult> {
    const res = await this.payments.getStatus(reference);
    return { reference: res.reference, status: res.status, provider: res.provider };
  }
}
