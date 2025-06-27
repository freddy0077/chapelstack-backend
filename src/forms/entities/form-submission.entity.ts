import { Field, ID, ObjectType } from '@nestjs/graphql';
import { GraphQLISODateTime } from '@nestjs/graphql';
import { Form } from './form.entity';
import { SubmissionStatus } from '../enums/submission-status.enum';

// Type is intentionally not used directly to avoid circular dependency

@ObjectType()
export class FormSubmission {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  formId: string;

  @Field(() => GraphQLISODateTime)
  submittedAt: Date;

  @Field(() => String, { nullable: true })
  ipAddress: string | null;

  @Field(() => String, { nullable: true })
  userAgent: string | null;

  @Field(() => SubmissionStatus)
  status: SubmissionStatus;

  @Field(() => String, { nullable: true })
  branchId: string | null;

  @Field(() => String, { nullable: true })
  submittedById: string | null;

  @Field(() => Form, { nullable: true })
  form: Form | null;

  @Field(() => [String], {
    description: 'FormFieldValue array',
    nullable: true,
  })
  fieldValues: any[] | null;
}
