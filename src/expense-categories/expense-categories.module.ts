import { Module } from '@nestjs/common';
import { ExpenseCategoriesService } from './expense-categories.service';
import { ExpenseCategoriesResolver } from './expense-categories.resolver';

@Module({
  providers: [ExpenseCategoriesResolver, ExpenseCategoriesService],
})
export class ExpenseCategoriesModule {}
