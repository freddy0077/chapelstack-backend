import { Resolver, Query, Args } from '@nestjs/graphql';
import { PaymentMethod } from './payment-method.entity';
import { PrismaService } from 'src/prisma/prisma.service';

@Resolver(() => PaymentMethod)
export class PaymentMethodResolver {
  constructor(private readonly prisma: PrismaService) {}

  @Query(() => [PaymentMethod])
  async paymentMethods(
    @Args('organisationId', { type: () => String, nullable: true }) organisationId?: string,
  ): Promise<PaymentMethod[]> {
    const where: any = {};
    if (organisationId) where.organisationId = organisationId;
    // Fetch up to 50 to ensure uniqueness, then filter for unique names
    const methods = await this.prisma.paymentMethod.findMany({ where, orderBy: { createdAt: 'desc' }, take: 50 });
    const uniqueByName: Record<string, typeof methods[0]> = {};
    for (const method of methods) {
      if (!uniqueByName[method.name]) {
        uniqueByName[method.name] = method;
      }
      if (Object.keys(uniqueByName).length === 5) break;
    }
    return Object.values(uniqueByName);
  }
}
