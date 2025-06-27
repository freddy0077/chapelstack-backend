import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';
import { GraphQLISODateTime } from '@nestjs/graphql';
import { Form } from './form.entity';
import { FormFieldValue } from './form-field-value.entity';
import { FormFieldType } from '@prisma/client';

// Define the enum values explicitly
export enum FormFieldTypeEnum {
  TEXT = 'TEXT',
  TEXTAREA = 'TEXTAREA',
  NUMBER = 'NUMBER',
  EMAIL = 'EMAIL',
  PHONE = 'PHONE',
  DATE = 'DATE',
  TIME = 'TIME',
  DATETIME = 'DATETIME',
  SELECT = 'SELECT',
  MULTISELECT = 'MULTISELECT',
  CHECKBOX = 'CHECKBOX',
  RADIO = 'RADIO',
  FILE = 'FILE',
  IMAGE = 'IMAGE',
  SIGNATURE = 'SIGNATURE',
  ADDRESS = 'ADDRESS',
  NAME = 'NAME',
  HIDDEN = 'HIDDEN',
  HEADING = 'HEADING',
  PARAGRAPH = 'PARAGRAPH',
  DIVIDER = 'DIVIDER',
  SPACER = 'SPACER',
  CUSTOM = 'CUSTOM',
}

// Register the enum for GraphQL
registerEnumType(FormFieldTypeEnum, {
  name: 'FormFieldType',
  description: 'Type of form field',
});

@ObjectType()
export class FormField {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  formId: string;

  @Field(() => FormFieldTypeEnum)
  type: FormFieldType;

  @Field(() => String)
  label: string;

  @Field(() => String, { nullable: true })
  placeholder: string | null;

  @Field(() => String, { nullable: true })
  helpText: string | null;

  @Field(() => String, { nullable: true })
  defaultValue: string | null;

  @Field(() => GraphQLJSON, { nullable: true })
  options: any;

  @Field(() => Boolean)
  isRequired: boolean;

  @Field(() => Boolean)
  isUnique: boolean;

  @Field(() => GraphQLJSON, { nullable: true })
  validations: any;

  @Field(() => Number)
  order: number;

  @Field(() => Number)
  width: number;

  @Field(() => GraphQLJSON, { nullable: true })
  conditionalLogic: any;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;

  @Field(() => Form, { nullable: true })
  form?: Form;

  @Field(() => [FormFieldValue], { nullable: true })
  fieldValues?: FormFieldValue[];
}
