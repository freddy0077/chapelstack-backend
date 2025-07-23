import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class SubscriptionLifecycleResult {
  @Field(() => Int)
  expiredCount: number;

  @Field(() => Int)
  cancelledCount: number;

  @Field(() => Int)
  warningsCount: number;
}
