import { Field, ObjectType, Int } from '@nestjs/graphql';

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

  @Field(() => MemberStatisticsPeriod, { nullable: true })
  lastMonth?: MemberStatisticsPeriod;
}
