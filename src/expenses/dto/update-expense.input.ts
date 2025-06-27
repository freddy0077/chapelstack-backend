import { CreateExpenseInput } from './create-expense.input';
import { InputType, Field, PartialType } from '@nestjs/graphql';
import { IsNotEmpty, IsUUID } from 'class-validator';

@InputType()
export class UpdateExpenseInput extends PartialType(CreateExpenseInput) {
  @Field(() => String)
  @IsNotEmpty()
  @IsUUID()
  id: string;
}
