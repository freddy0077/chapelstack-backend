import { Field, ID, ObjectType } from '@nestjs/graphql';
import { MessageStatus } from '@prisma/client';
import { RecipientInfoDto } from './recipient-info.dto';

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

  @Field(() => [RecipientInfoDto], { nullable: true })
  recipientInfo?: RecipientInfoDto[];

  @Field(() => Date, { nullable: true })
  sentAt?: Date | null;

  @Field(() => String)
  status: MessageStatus;

  @Field(() => String, { nullable: true })
  organisationId?: string | null;

  @Field(() => String, { nullable: true })
  branchId?: string | null;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}
