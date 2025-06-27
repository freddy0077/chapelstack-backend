import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class MessagePerformanceMetrics {
  @Field(() => String)
  templateName: string;

  @Field(() => Int)
  totalSent: number;

  @Field(() => Int)
  delivered: number;

  @Field(() => Float)
  deliveryRate: number;

  @Field(() => Int, { nullable: true })
  opened?: number;

  @Field(() => Float, { nullable: true })
  openRate?: number;

  @Field(() => Float, { nullable: true })
  clickRate?: number;

  @Field(() => Float, { nullable: true })
  responseRate?: number;

  @Field(() => String, { nullable: true })
  averageResponseTime?: string;
}

@ObjectType()
export class MessagePerformanceEntity {
  @Field(() => [MessagePerformanceMetrics])
  templates: MessagePerformanceMetrics[];

  @Field(() => Float)
  overallDeliveryRate: number;

  @Field(() => Float, { nullable: true })
  overallOpenRate?: number;

  @Field(() => Float, { nullable: true })
  overallResponseRate?: number;
}
