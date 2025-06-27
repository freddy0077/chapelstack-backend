import { Resolver, Query, Args } from '@nestjs/graphql';
import { PaymentMethod } from './payment-method.entity';
import { PrismaService } from 'src/prisma/prisma.service';

@Resolver(() => PaymentMethod)
export class PaymentMethodResolver {
  constructor(private readonly prisma: PrismaService) {}

  @Query(() => [PaymentMethod])
  paymentMethods(
    @Args('organisationId') organisationId: string,
  ): Promise<PaymentMethod[]> {
    return this.prisma.paymentMethod.findMany({ where: { organisationId } });
  }
}
