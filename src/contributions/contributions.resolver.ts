import { Resolver, Query, Mutation, Args, ResolveField, Parent } from '@nestjs/graphql';
import { ContributionsService } from './contributions.service';
import { Contribution } from './entities/contribution.entity';
import { CreateContributionInput } from './dto/create-contribution.input';
import { UpdateContributionInput } from './dto/update-contribution.input';
import { PrismaService } from 'src/prisma/prisma.service';
import { ContributionType } from 'src/contribution-types/contribution-type.entity';
import { PaymentMethod } from 'src/payment-methods/payment-method.entity';
import { Fund } from 'src/funds/entities/fund.entity';
import { Member } from 'src/members/entities/member.entity';

@Resolver(() => Contribution)
export class ContributionsResolver {
  constructor(
    private readonly contributionsService: ContributionsService,
    private readonly prisma: PrismaService,
  ) {}

  @Mutation(() => Contribution)
  createContribution(
    @Args('createContributionInput')
    createContributionInput: CreateContributionInput,
  ) {
    return this.contributionsService.create(createContributionInput);
  }

  @Query(() => [Contribution], { name: 'contributions' })
  findAll(
    @Args('organisationId', { type: () => String, nullable: true })
    organisationId?: string,
  ) {
    return this.contributionsService.findAll(organisationId);
  }

  @Query(() => Contribution, { name: 'contribution' })
  findOne(@Args('id', { type: () => String }) id: string) {
    return this.contributionsService.findOne(id);
  }

  @Mutation(() => Contribution)
  updateContribution(
    @Args('updateContributionInput')
    updateContributionInput: UpdateContributionInput,
  ) {
    return this.contributionsService.update(
      updateContributionInput.id,
      updateContributionInput,
    );
  }

  @Mutation(() => Contribution)
  removeContribution(@Args('id', { type: () => String }) id: string) {
    return this.contributionsService.remove(id);
  }

  @ResolveField('contributionType', () => ContributionType)
  getContributionType(@Parent() contribution: Contribution) {
    return this.prisma.contributionType.findUnique({ where: { id: contribution.contributionTypeId } });
  }

  @ResolveField('paymentMethod', () => PaymentMethod)
  getPaymentMethod(@Parent() contribution: Contribution) {
    return this.prisma.paymentMethod.findUnique({ where: { id: contribution.paymentMethodId } });
  }

  @ResolveField('fund', () => Fund)
  getFund(@Parent() contribution: Contribution) {
    return this.prisma.fund.findUnique({ where: { id: contribution.fundId } });
  }

  @ResolveField('member', () => Member, { nullable: true })
  getMember(@Parent() contribution: Contribution) {
    if (!contribution.memberId) {
      return null;
    }
    return this.prisma.member.findUnique({ where: { id: contribution.memberId } });
  }
}
