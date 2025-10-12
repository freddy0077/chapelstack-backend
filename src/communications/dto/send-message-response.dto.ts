import { ObjectType, Field, Int } from '@nestjs/graphql';
import { MessageStatus } from '@prisma/client';

@ObjectType()
export class SendMessageResponse {
  @Field()
  success: boolean;

  @Field()
  messageId: string;

  @Field(() => Int)
  recipientCount: number;

  @Field({ nullable: true })
  scheduledFor?: Date;

  @Field()
  status: string;

  @Field({ nullable: true })
  estimatedDelivery?: Date;

  @Field({ nullable: true })
  message?: string;
}
