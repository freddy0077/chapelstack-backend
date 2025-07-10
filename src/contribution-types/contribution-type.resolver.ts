import { Resolver, Query, Args } from '@nestjs/graphql';
import { ContributionType } from './contribution-type.entity';
import { PrismaService } from 'src/prisma/prisma.service';

@Resolver(() => ContributionType)
export class ContributionTypeResolver {
  constructor(private readonly prisma: PrismaService) {}

  @Query(() => [ContributionType])
  contributionTypes(
    @Args('organisationId', { type: () => String, nullable: true })
    organisationId?: string,
    @Args('branchId', { type: () => String, nullable: true }) branchId?: string,
  ): Promise<ContributionType[]> {
    // If you have a payment method resolver, ensure its organisationId argument is also nullable/type: String
    const where: any = {};
    if (organisationId) where.organisationId = organisationId;
    if (branchId) where.branchId = branchId;
    return this.prisma.contributionType.findMany({
      where,
      take: 5,
      orderBy: { createdAt: 'desc' },
    });
  }
}
