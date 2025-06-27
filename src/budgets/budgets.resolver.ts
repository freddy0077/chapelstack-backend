import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { BudgetsService } from './budgets.service';
import { Budget } from './entities/budget.entity';
import { CreateBudgetInput } from './dto/create-budget.input';
import { UpdateBudgetInput } from './dto/update-budget.input';

@Resolver(() => Budget)
export class BudgetsResolver {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Mutation(() => Budget)
  createBudget(@Args('createBudgetInput') createBudgetInput: CreateBudgetInput) {
    return this.budgetsService.create(createBudgetInput);
  }

  @Query(() => [Budget], { name: 'budgets' })
  findAll(@Args('organisationId', { type: () => String, nullable: true }) organisationId?: string) {
    return this.budgetsService.findAll(organisationId);
  }

  @Query(() => Budget, { name: 'budget' })
  findOne(@Args('id', { type: () => String }) id: string) {
    return this.budgetsService.findOne(id);
  }

  @Mutation(() => Budget)
  updateBudget(@Args('updateBudgetInput') updateBudgetInput: UpdateBudgetInput) {
    return this.budgetsService.update(updateBudgetInput.id, updateBudgetInput);
  }

  @Mutation(() => Budget)
  removeBudget(@Args('id', { type: () => String }) id: string) {
    return this.budgetsService.remove(id);
  }
}
