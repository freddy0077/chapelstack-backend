import { ObjectType, Field, ID, InputType } from '@nestjs/graphql';
import { Branch } from '../../branches/entities/branch.entity';
import { Organisation } from '../../organisation/dto/organisation.model';
import { MessageStatus } from '../enums/message-status.enum';

@ObjectType()
@InputType('SmsMessageInput')
export class SmsMessage {
  @Field(() => ID)
  id: string;

  @Field()
  body: string;

  @Field()
  senderNumber: string;

  @Field(() => [String])
  recipients: string[];

  @Field({ nullable: true })
  sentAt?: Date;

  @Field(() => MessageStatus)
  status: MessageStatus;

  @Field(() => Branch, { nullable: true })
  branch?: Branch;

  @Field(() => String, { nullable: true })
  branchId?: string | null;

  @Field(() => Organisation, { nullable: true })
  organisation?: Organisation;

  @Field(() => String, { nullable: true })
  organisationId?: string | null;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
