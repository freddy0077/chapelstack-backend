import { Field, ID, InputType, PartialType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';
import { CreateChildrenEventInput } from './create-children-event.input';

@InputType()
export class UpdateChildrenEventInput extends PartialType(
  CreateChildrenEventInput,
) {
  @Field(() => ID)
  @IsString()
  @IsNotEmpty()
  id: string;
}
