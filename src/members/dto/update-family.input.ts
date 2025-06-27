import { InputType, Field, ID, PartialType } from '@nestjs/graphql';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { CreateFamilyInput } from './create-family.input';

@InputType()
export class UpdateFamilyInput extends PartialType(CreateFamilyInput) {
  @Field(() => ID)
  @IsNotEmpty()
  @IsUUID()
  id: string;
}
