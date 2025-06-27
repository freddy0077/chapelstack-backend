import { CreateBudgetInput } from './create-budget.input';
import { InputType, Field, PartialType } from '@nestjs/graphql';
import { IsNotEmpty, IsUUID } from 'class-validator';

@InputType()
export class UpdateBudgetInput extends PartialType(CreateBudgetInput) {
  @Field(() => String)
  @IsNotEmpty()
  @IsUUID()
  id: string;
}
