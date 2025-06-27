import { Field, InputType, PartialType } from '@nestjs/graphql';
import { CreateFormInput } from './create-form.input';
import { IsNotEmpty, IsUUID } from 'class-validator';

@InputType()
export class UpdateFormInput extends PartialType(CreateFormInput) {
  @Field()
  @IsUUID()
  @IsNotEmpty()
  id: string;
}
