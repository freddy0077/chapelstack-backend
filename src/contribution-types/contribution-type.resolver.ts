import { Resolver, Query } from '@nestjs/graphql';
import { ContributionType } from './contribution-type.entity';
import { PrismaService } from 'src/prisma/prisma.service';

@Resolver(() => ContributionType)
export class ContributionTypeResolver {
  constructor(private readonly prisma: PrismaService) {}

  @Query(() => [ContributionType])
  contributionTypes(): Promise<ContributionType[]> {
    return this.prisma.contributionType.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
    });
  }
}
