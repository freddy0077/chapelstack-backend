import { ObjectType, Field, ID, InputType } from '@nestjs/graphql';
import { Branch } from '../../branches/entities/branch.entity';
import { Organisation } from '../../organisation/dto/organisation.model';
import { EmailTemplate } from './email-template.entity';
import { MessageStatus } from '../enums/message-status.enum';

@ObjectType()
@InputType('EmailMessageInput')
export class EmailMessage {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  subject: string;

  @Field(() => String)
  bodyHtml: string;

  @Field({ nullable: true })
  bodyText?: string;

  @Field(() => String)
  senderEmail: string;

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

  @Field(() => EmailTemplate, { nullable: true })
  template?: EmailTemplate;

  @Field(() => String, { nullable: true })
  templateId?: string | null;

  @Field(() => Organisation, { nullable: true })
  organisation?: Organisation;

  @Field(() => String, { nullable: true })
  organisationId?: string | null;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}
