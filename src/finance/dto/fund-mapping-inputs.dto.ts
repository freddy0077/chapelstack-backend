import { InputType, Field, ID } from '@nestjs/graphql';

@InputType()
export class ContributionTypeFundMappingFilterInput {
  @Field({ nullable: true })
  branchId?: string;

  @Field({ nullable: true })
  organisationId?: string;

  @Field({ nullable: true })
  contributionTypeId?: string;

  @Field({ nullable: true })
  fundId?: string;

  @Field({ nullable: true })
  isActive?: boolean;
}

@InputType()
export class CreateContributionTypeFundMappingInput {
  @Field()
  contributionTypeId: string;

  @Field()
  fundId: string;

  @Field({ nullable: true })
  branchId?: string;

  @Field({ nullable: true })
  organisationId?: string;

  @Field({ nullable: true })
  isActive?: boolean;
}

@InputType()
export class UpdateContributionTypeFundMappingInput {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  fundId?: string;

  @Field({ nullable: true })
  isActive?: boolean;
}
