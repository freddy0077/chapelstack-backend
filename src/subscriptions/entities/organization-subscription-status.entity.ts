import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Subscription } from './subscription.entity';

@ObjectType()
export class OrganizationSubscriptionStatus {
  @Field()
  hasActiveSubscription: boolean;

  @Field(() => Subscription, { nullable: true })
  subscription?: Subscription;

  @Field(() => Int, { nullable: true })
  daysUntilExpiry?: number;

  @Field({ nullable: true })
  isInGracePeriod?: boolean;
}
