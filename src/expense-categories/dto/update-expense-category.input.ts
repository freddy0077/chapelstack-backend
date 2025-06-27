import { CreateExpenseCategoryInput } from './create-expense-category.input';
import { InputType, Field, PartialType } from '@nestjs/graphql';
import { IsNotEmpty, IsUUID } from 'class-validator';

@InputType()
export class UpdateExpenseCategoryInput extends PartialType(
  CreateExpenseCategoryInput,
) {
  @Field(() => String)
  @IsNotEmpty()
  @IsUUID()
  id: string;
}
