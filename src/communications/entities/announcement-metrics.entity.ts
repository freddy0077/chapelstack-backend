import { ObjectType, Field, Int, Float } from '@nestjs/graphql';

@ObjectType()
export class AnnouncementMetrics {
  @Field(() => Int)
  totalReads: number;

  @Field(() => Int)
  totalDeliveries: number;

  @Field(() => Int)
  emailSent: number;

  @Field(() => Int)
  emailOpened: number;

  @Field(() => Float)
  emailOpenRate: number;

  @Field(() => Int)
  pushSent: number;

  @Field(() => Int)
  linkClicked: number;

  @Field(() => Float)
  clickRate: number;
}
