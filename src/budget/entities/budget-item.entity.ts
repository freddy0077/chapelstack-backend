import { ObjectType, Field, Float, ID } from '@nestjs/graphql';
import { Budget } from './budget.entity';
import { ExpenseCategory } from '../../expense-categories/entities/expense-category.entity';

@ObjectType()
export class BudgetItem {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => Float)
  amount: number;

  @Field(() => String)
  budgetId: string;

  @Field(() => String, { nullable: true })
  expenseCategoryId?: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  // Relations
  @Field(() => Budget, { nullable: true })
  budget?: Budget;

  @Field(() => ExpenseCategory, { nullable: true })
  expenseCategory?: ExpenseCategory;
}
