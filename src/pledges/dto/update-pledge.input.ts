import { CreatePledgeInput } from './create-pledge.input';
import { InputType, Field, PartialType } from '@nestjs/graphql';
import { IsNotEmpty, IsUUID } from 'class-validator';

@InputType()
export class UpdatePledgeInput extends PartialType(CreatePledgeInput) {
  @Field(() => String)
  @IsNotEmpty()
  @IsUUID()
  id: string;
}
