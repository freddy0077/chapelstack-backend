import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class ContributionTypeInfo {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  isActive: boolean;
}

@ObjectType()
export class FundInfo {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  isActive: boolean;
}

@ObjectType()
export class ContributionTypeFundMapping {
  @Field(() => ID)
  id: string;

  @Field()
  contributionTypeId: string;

  @Field()
  fundId: string;

  @Field({ nullable: true })
  branchId?: string;

  @Field({ nullable: true })
  organisationId?: string;

  @Field()
  isActive: boolean;

  @Field()
  createdAt: string;

  @Field()
  updatedAt: string;

  @Field({ nullable: true })
  createdBy?: string;

  @Field({ nullable: true })
  updatedBy?: string;

  // Relations will be resolved by the resolver
  @Field(() => ContributionTypeInfo, { nullable: true })
  contributionType?: ContributionTypeInfo;

  @Field(() => FundInfo, { nullable: true })
  fund?: FundInfo;
}

@ObjectType()
export class FundMappingConfiguration {
  @Field()
  branchId: string;

  @Field()
  organisationId: string;

  @Field()
  lastUpdated: string;

  @Field(() => [ContributionTypeFundMapping])
  mappings: ContributionTypeFundMapping[];

  @Field(() => [ContributionTypeInfo])
  availableContributionTypes: ContributionTypeInfo[];

  @Field(() => [FundInfo])
  availableFunds: FundInfo[];
}

@ObjectType()
export class PaginatedContributionTypeFundMappings {
  @Field()
  total: number;

  @Field(() => [ContributionTypeFundMapping])
  mappings: ContributionTypeFundMapping[];
}
