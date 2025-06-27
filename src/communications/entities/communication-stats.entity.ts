import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class MessageStatusCount {
  @Field(() => String)
  status: string;

  @Field(() => Int)
  count: number;
}

@ObjectType()
export class MessageTypeCount {
  @Field(() => String)
  type: string;

  @Field(() => Int)
  count: number;
}

@ObjectType()
export class MessageTimeSeriesData {
  @Field(() => String)
  date: string;

  @Field(() => Int)
  count: number;
}

@ObjectType()
export class CommunicationStatsEntity {
  @Field(() => Int)
  totalEmailsSent: number;

  @Field(() => Int)
  totalSmsSent: number;

  @Field(() => Int)
  totalNotifications: number;

  @Field(() => [MessageStatusCount])
  emailStatusCounts: MessageStatusCount[];

  @Field(() => [MessageStatusCount])
  smsStatusCounts: MessageStatusCount[];

  @Field(() => [MessageTimeSeriesData])
  messagesByDate: MessageTimeSeriesData[];

  @Field(() => Int)
  activeTemplates: number;

  @Field(() => Int)
  deliveryRate: number;

  @Field(() => Int, { nullable: true })
  averageResponseTime?: number;
}

@ObjectType()
export class CommunicationChannelStats {
  @Field(() => String)
  channel: string;

  @Field(() => Int)
  messagesSent: number;

  @Field(() => Int)
  deliveryRate: number;

  @Field(() => Int, { nullable: true })
  openRate?: number;
}

@ObjectType()
export class RecipientGroupStats {
  @Field(() => String)
  groupName: string;

  @Field(() => Int)
  recipientCount: number;

  @Field(() => Int)
  messagesSent: number;
}
