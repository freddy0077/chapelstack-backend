import { CreateFundInput } from './create-fund.input';
import { InputType, Field, PartialType } from '@nestjs/graphql';
import { IsNotEmpty, IsUUID } from 'class-validator';

@InputType()
export class UpdateFundInput extends PartialType(CreateFundInput) {
  @Field(() => String)
  @IsNotEmpty()
  @IsUUID()
  id: string;
}
