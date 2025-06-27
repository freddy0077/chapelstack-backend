import { Field, ID, ObjectType } from '@nestjs/graphql';
import { MessageStatus } from '@prisma/client';

@ObjectType()
export class SmsMessageDto {
  @Field(() => ID)
  id: string;

  @Field()
  body: string;

  @Field()
  senderNumber: string;

  @Field(() => [String])
  recipients: string[];

  @Field(() => Date, { nullable: true })
  sentAt?: Date | null;

  @Field(() => String)
  status: MessageStatus;

  @Field(() => String, { nullable: true })
  branchId?: string | null;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}
