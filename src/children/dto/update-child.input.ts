import { Field, ID, InputType, PartialType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';
import { CreateChildInput } from './create-child.input';

@InputType()
export class UpdateChildInput extends PartialType(CreateChildInput) {
  @Field(() => ID)
  @IsString()
  @IsNotEmpty()
  id: string;
}
