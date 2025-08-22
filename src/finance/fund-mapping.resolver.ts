import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { FundMappingService } from './fund-mapping.service';
import {
  FundMappingConfiguration,
  ContributionTypeFundMapping,
  PaginatedContributionTypeFundMappings,
} from './entities/contribution-type-fund-mapping.entity';
import {
  ContributionTypeFundMappingFilterInput,
  CreateContributionTypeFundMappingInput,
  UpdateContributionTypeFundMappingInput,
} from './dto/fund-mapping-inputs.dto';

@Resolver(() => ContributionTypeFundMapping)
export class FundMappingResolver {
  constructor(private readonly fundMappingService: FundMappingService) {}

  @Query(() => FundMappingConfiguration, { name: 'fundMappingConfiguration' })
  getFundMappingConfiguration(
    @Args('branchId', { type: () => ID }) branchId: string,
    @Args('organisationId', { type: () => ID }) organisationId: string,
  ) {
    return this.fundMappingService.getFundMappingConfiguration(
      branchId,
      organisationId,
    );
  }

  @Query(() => PaginatedContributionTypeFundMappings, {
    name: 'contributionTypeFundMappings',
  })
  getContributionTypeFundMappings(
    @Args('filter') filter: ContributionTypeFundMappingFilterInput,
  ) {
    return this.fundMappingService.getContributionTypeFundMappings(filter);
  }

  @Query(() => String, { name: 'getFundForContributionType', nullable: true })
  getFundForContributionType(
    @Args('contributionTypeId', { type: () => ID }) contributionTypeId: string,
    @Args('branchId', { type: () => ID }) branchId: string,
    @Args('organisationId', { type: () => ID }) organisationId: string,
  ) {
    return this.fundMappingService.getFundForContributionType(
      contributionTypeId,
      branchId,
      organisationId,
    );
  }

  @Query(() => String, {
    name: 'getFundForContributionTypeName',
    nullable: true,
  })
  getFundForContributionTypeName(
    @Args('contributionTypeName') contributionTypeName: string,
    @Args('branchId', { type: () => ID }) branchId: string,
    @Args('organisationId', { type: () => ID }) organisationId: string,
  ) {
    return this.fundMappingService.getFundForContributionTypeName(
      contributionTypeName,
      branchId,
      organisationId,
    );
  }

  @Mutation(() => ContributionTypeFundMapping)
  createContributionTypeFundMapping(
    @Args('input') input: CreateContributionTypeFundMappingInput,
  ) {
    return this.fundMappingService.createContributionTypeFundMapping(input);
  }

  @Mutation(() => ContributionTypeFundMapping)
  updateContributionTypeFundMapping(
    @Args('input') input: UpdateContributionTypeFundMappingInput,
  ) {
    return this.fundMappingService.updateContributionTypeFundMapping(input);
  }

  @Mutation(() => ContributionTypeFundMapping)
  deleteContributionTypeFundMapping(
    @Args('id', { type: () => ID }) id: string,
  ) {
    return this.fundMappingService.deleteContributionTypeFundMapping(id);
  }

  @Mutation(() => [ContributionTypeFundMapping])
  createDefaultFundMappings(
    @Args('branchId', { type: () => ID }) branchId: string,
    @Args('organisationId', { type: () => ID }) organisationId: string,
  ) {
    return this.fundMappingService.createDefaultFundMappings(
      branchId,
      organisationId,
    );
  }
}
