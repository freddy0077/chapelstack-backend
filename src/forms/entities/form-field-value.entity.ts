import { Field, ID, ObjectType } from '@nestjs/graphql';
import { GraphQLISODateTime } from '@nestjs/graphql';
import { FormField } from './form-field.entity';

@ObjectType()
export class FormFieldValue {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  submissionId: string;

  @Field(() => String)
  fieldId: string;

  @Field(() => String, { nullable: true })
  value: string | null;

  @Field(() => String, { nullable: true })
  fileUrl: string | null;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => String, { description: 'FormSubmission', nullable: true })
  submission: Record<string, unknown> | null;

  @Field(() => FormField, { nullable: true })
  field: FormField | null;
}
