import { ObjectType, Field, ID, Int } from '@nestjs/graphql';;

@ObjectType()
export class ContributionTypeInfo {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Boolean)
  isActive: boolean;
}

@ObjectType()
export class FundInfo {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Boolean)
  isActive: boolean;
}

@ObjectType()
export class ContributionTypeFundMapping {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  contributionTypeId: string;

  @Field(() => String)
  fundId: string;

  @Field({ nullable: true })
  branchId?: string;

  @Field({ nullable: true })
  organisationId?: string;

  @Field(() => Boolean)
  isActive: boolean;

  @Field(() => String)
  createdAt: string;

  @Field(() => String)
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
  @Field(() => String)
  branchId: string;

  @Field(() => String)
  organisationId: string;

  @Field(() => String)
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
  @Field(() => Int)
  total: number;

  @Field(() => [ContributionTypeFundMapping])
  mappings: ContributionTypeFundMapping[];
}
