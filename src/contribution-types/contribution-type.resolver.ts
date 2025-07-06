import { Resolver, Query, Args } from '@nestjs/graphql';
import { ContributionType } from './contribution-type.entity';
import { PrismaService } from 'src/prisma/prisma.service';

@Resolver(() => ContributionType)
export class ContributionTypeResolver {
  constructor(private readonly prisma: PrismaService) {}

  @Query(() => [ContributionType])
  contributionTypes(
    @Args('organisationId') organisationId: string,
    @Args('branchId', { nullable: true }) branchId?: string,
  ): Promise<ContributionType[]> {
    return this.prisma.contributionType.findMany({
      where: {
        organisationId,
        ...(branchId && { branchId }),
      },
    });
  }
}
