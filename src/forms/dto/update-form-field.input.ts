import { Field, InputType, PartialType } from '@nestjs/graphql';
import { CreateFormFieldInput } from './create-form-field.input';
import { IsNotEmpty, IsUUID } from 'class-validator';

@InputType()
export class UpdateFormFieldInput extends PartialType(CreateFormFieldInput) {
  @Field()
  @IsUUID()
  @IsNotEmpty()
  id: string;
}
