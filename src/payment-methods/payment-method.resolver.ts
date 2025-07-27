import { Resolver, Query } from '@nestjs/graphql';
import { PaymentMethod } from './payment-method.entity';
import { PrismaService } from 'src/prisma/prisma.service';

@Resolver(() => PaymentMethod)
export class PaymentMethodResolver {
  constructor(private readonly prisma: PrismaService) {}

  @Query(() => [PaymentMethod])
  async paymentMethods(): Promise<PaymentMethod[]> {
    // Fetch up to 50 to ensure uniqueness, then filter for unique names
    const methods = await this.prisma.paymentMethod.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    const uniqueByName: Record<string, (typeof methods)[0]> = {};
    for (const method of methods) {
      if (!uniqueByName[method.name]) {
        uniqueByName[method.name] = method;
      }
      if (Object.keys(uniqueByName).length === 5) break;
    }
    return Object.values(uniqueByName);
  }
}
