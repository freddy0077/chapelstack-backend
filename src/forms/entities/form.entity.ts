import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { FormField } from './form-field.entity';
import { FormSubmission } from './form-submission.entity';
import { GraphQLISODateTime } from '@nestjs/graphql';
import { FormStatus } from '@prisma/client';

// Define the enum values explicitly
export enum FormStatusEnum {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
  CLOSED = 'CLOSED',
}

registerEnumType(FormStatusEnum, {
  name: 'FormStatus',
  description: 'Status of a form',
});

@ObjectType()
export class Form {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  title: string;

  @Field(() => String, { nullable: true })
  description: string | null;

  @Field(() => FormStatusEnum)
  status: FormStatus;

  @Field(() => Boolean)
  isPublic: boolean;

  @Field(() => String)
  slug: string;

  @Field(() => String, { nullable: true })
  successMessage: string | null;

  @Field(() => String, { nullable: true })
  redirectUrl: string | null;

  @Field(() => Boolean)
  enableCaptcha: boolean;

  @Field(() => [String])
  notifyEmails: string[];

  @Field(() => String, { nullable: true })
  branchId: string | null;

  @Field(() => String)
  createdById: string;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  expiresAt: Date | null;

  @Field(() => Number)
  submissionCount: number;

  @Field(() => [FormField], { nullable: true })
  fields?: FormField[];

  @Field(() => [FormSubmission], { nullable: true })
  submissions?: FormSubmission[];
}
