import { Field, ObjectType, ID } from '@nestjs/graphql';

@ObjectType()
export class AgeDistribution {
  @Field(() => String)
  ageGroup: string;

  @Field(() => Number)
  count: number;

  @Field(() => Number)
  percentage: number;
}

@ObjectType()
export class GenderDistribution {
  @Field(() => Number)
  maleCount: number;

  @Field(() => Number)
  femaleCount: number;

  @Field(() => Number)
  otherCount: number;

  @Field(() => Number)
  malePercentage: number;

  @Field(() => Number)
  femalePercentage: number;

  @Field(() => Number)
  otherPercentage: number;
}

@ObjectType()
export class MembershipStatusDistribution {
  @Field(() => String)
  status: string;

  @Field(() => Number)
  count: number;

  @Field(() => Number)
  percentage: number;
}

@ObjectType()
export class MemberDemographicsData {
  @Field(() => ID, { nullable: true })
  branchId?: string;

  @Field(() => ID, { nullable: true })
  organisationId?: string;

  @Field({ nullable: true })
  branchName?: string;

  @Field(() => Date)
  startDate: Date;

  @Field(() => Date)
  endDate: Date;

  @Field(() => Number)
  totalMembers: number;

  @Field(() => Number)
  newMembersInPeriod: number;

  @Field(() => [AgeDistribution])
  ageDistribution: AgeDistribution[];

  @Field(() => GenderDistribution)
  genderDistribution: GenderDistribution;

  @Field(() => [MembershipStatusDistribution])
  membershipStatusDistribution: MembershipStatusDistribution[];
}
