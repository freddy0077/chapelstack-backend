import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { BudgetService } from './budget.service';
import { Budget } from './entities/budget.entity';
import { BudgetItem } from './entities/budget-item.entity';
import { CreateBudgetInput } from './dto/create-budget.input';
import { UpdateBudgetInput } from './dto/update-budget.input';
import { CreateBudgetItemInput } from './dto/create-budget-item.input';
import { UpdateBudgetItemInput } from './dto/update-budget-item.input';

@Resolver(() => Budget)
export class BudgetResolver {
  constructor(private readonly budgetService: BudgetService) {}

  // ==================== BUDGET QUERIES ====================

  @Query(() => [Budget], { name: 'budgets' })
  getBudgets(
    @Args('organisationId') organisationId: string,
    @Args('branchId', { nullable: true }) branchId?: string,
    @Args('fundId', { nullable: true }) fundId?: string,
    @Args('fiscalYear', { nullable: true }) fiscalYear?: number,
    @Args('status', { nullable: true }) status?: string,
  ) {
    return this.budgetService.getBudgets(
      organisationId,
      branchId,
      fundId,
      fiscalYear,
      status,
    );
  }

  @Query(() => Budget, { name: 'budget', nullable: true })
  getBudget(@Args('id', { type: () => ID }) id: string) {
    return this.budgetService.getBudgetById(id);
  }

  // ==================== BUDGET MUTATIONS ====================

  @Mutation(() => Budget)
  createBudget(@Args('input') input: CreateBudgetInput) {
    return this.budgetService.createBudget(input);
  }

  @Mutation(() => Budget)
  updateBudget(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateBudgetInput,
  ) {
    return this.budgetService.updateBudget(id, input);
  }

  @Mutation(() => Boolean)
  async deleteBudget(@Args('id', { type: () => ID }) id: string) {
    await this.budgetService.deleteBudget(id);
    return true;
  }

  // ==================== BUDGET ITEM MUTATIONS ====================

  @Mutation(() => BudgetItem)
  createBudgetItem(@Args('input') input: CreateBudgetItemInput) {
    return this.budgetService.createBudgetItem(input);
  }

  @Mutation(() => BudgetItem)
  updateBudgetItem(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateBudgetItemInput,
  ) {
    return this.budgetService.updateBudgetItem(id, input);
  }

  @Mutation(() => Boolean)
  async deleteBudgetItem(@Args('id', { type: () => ID }) id: string) {
    await this.budgetService.deleteBudgetItem(id);
    return true;
  }
}
