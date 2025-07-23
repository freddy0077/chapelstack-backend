import { Field, ObjectType, Int, Float } from '@nestjs/graphql';
import { GenderDistribution } from '../../reporting/entities/member-demographics-data.entity';

@ObjectType()
export class MemberStatisticsPeriod {
  @Field(() => Int)
  totalMembers: number;

  @Field(() => Int)
  activeMembers: number;

  @Field(() => Int)
  inactiveMembers: number;

  @Field(() => Int)
  newMembersInPeriod: number;

  @Field(() => Int)
  visitorsInPeriod: number;
}

@ObjectType()
export class MemberAgeGroup {
  @Field()
  range: string;

  @Field(() => Int)
  count: number;

  @Field(() => Float)
  percentage: number;
}

@ObjectType()
export class MemberStatistics {
  @Field(() => Int)
  totalMembers: number;

  @Field(() => Int)
  activeMembers: number;

  @Field(() => Int)
  inactiveMembers: number;

  @Field(() => Int)
  newMembersInPeriod: number;

  @Field(() => Int)
  visitorsInPeriod: number;

  @Field(() => Float)
  growthRate: number;

  @Field(() => Float)
  retentionRate: number;

  @Field(() => Float)
  conversionRate: number;

  @Field(() => Float)
  averageAge: number;

  @Field(() => GenderDistribution)
  genderDistribution: GenderDistribution;

  @Field(() => [MemberAgeGroup])
  ageGroups: MemberAgeGroup[];

  @Field(() => MemberStatisticsPeriod, { nullable: true })
  lastMonth?: MemberStatisticsPeriod;
}
