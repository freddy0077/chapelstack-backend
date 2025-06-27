import { Field, ID, ObjectType } from '@nestjs/graphql';
import { MessageStatus } from '@prisma/client';

@ObjectType()
export class EmailMessageDto {
  @Field(() => ID)
  id: string;

  @Field()
  subject: string;

  @Field()
  bodyHtml: string;

  @Field({ nullable: true })
  bodyText?: string;

  @Field()
  senderEmail: string;

  @Field(() => [String])
  recipients: string[];

  @Field(() => Date, { nullable: true })
  sentAt?: Date | null;

  @Field(() => String)
  status: MessageStatus;

  @Field(() => String, { nullable: true })
  branchId?: string | null;

  @Field(() => String, { nullable: true })
  templateId?: string | null;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}
