import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class SubscriptionLifecycleStats {
  @Field(() => Int)
  totalSubscriptions: number;

  @Field(() => Int)
  activeSubscriptions: number;

  @Field(() => Int)
  trialSubscriptions: number;

  @Field(() => Int)
  pastDueSubscriptions: number;

  @Field(() => Int)
  cancelledSubscriptions: number;

  @Field(() => Int)
  expiringIn7Days: number;

  @Field(() => Int)
  expiringIn30Days: number;
}
