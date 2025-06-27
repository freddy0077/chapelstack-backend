import { Module } from '@nestjs/common';
import { BudgetsService } from './budgets.service';
import { BudgetsResolver } from './budgets.resolver';

@Module({
  providers: [BudgetsResolver, BudgetsService],
})
export class BudgetsModule {}
