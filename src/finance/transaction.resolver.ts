import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  ResolveField,
  Parent,
  Context,
} from '@nestjs/graphql';
import { TransactionService } from './transaction.service';
import { Transaction } from './entities/transaction.entity';
import { TransactionAuditLog } from './entities/transaction-audit-log.entity';
import { CreateTransactionInput } from './dto/create-transaction.input';
import { UpdateTransactionInput } from './dto/update-transaction.input';
import { VoidTransactionInput } from './dto/void-transaction.input';
import { TransactionType } from '@prisma/client';
import { registerEnumType } from '@nestjs/graphql';
import { PaginatedTransaction } from './dto/paginated-transaction.dto';
import { PaginationInput } from '../common/dto/pagination.input';
import { DateRangeInput } from '../common/dto/date-range.input';
import { TransactionStats } from './dto/transaction-stats.dto';
import { Fund } from '../funds/entities/fund.entity';
import { FundsService } from '../funds/funds.service';
import { FundsModule } from '../funds/funds.module';
import { PrismaService } from '../prisma/prisma.service';
import { Event } from '../events/entities/event.entity';
import { CashFlowAnalysis } from './dto/cash-flow-analysis.dto';
import { ComparativePeriodAnalysis } from './dto/comparative-period-analysis.dto';
import { MemberGivingAnalysis } from './dto/member-giving-analysis.dto';
import {
  CashFlowAnalysisInput,
  ComparativePeriodAnalysisInput,
  MemberGivingAnalysisInput,
} from './dto/analytics-inputs.dto';
import {
  FinancialStatementsInput,
  FinancialStatements,
} from './dto/financial-statements.dto';
import {
  BudgetVsActualInput,
  BudgetVsActual,
  BudgetPeriodType,
} from './dto/budget-vs-actual.dto';

registerEnumType(TransactionType, {
  name: 'TransactionType',
  description: 'The type of transaction',
});

registerEnumType(BudgetPeriodType, {
  name: 'BudgetPeriodType',
  description: 'The period type for budget analysis',
});

@Resolver(() => Transaction)
export class TransactionResolver {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly fundsService: FundsService,
    private readonly prisma: PrismaService,
  ) {}

  @Mutation(() => Transaction)
  createTransaction(
    @Args('createTransactionInput')
    createTransactionInput: CreateTransactionInput,
  ) {
    return this.transactionService.create(createTransactionInput);
  }

  @Query(() => PaginatedTransaction, { name: 'transactions' })
  findAll(
    @Args('organisationId', { nullable: true }) organisationId?: string,
    @Args('type', { type: () => TransactionType, nullable: true })
    type?: TransactionType,
    @Args('fundId', { nullable: true }) fundId?: string,
    @Args('branchId', { nullable: true }) branchId?: string,
    @Args('userId', { nullable: true }) userId?: string,
    @Args('eventId', { nullable: true }) eventId?: string,
    @Args('paginationInput', { nullable: true })
    paginationInput?: PaginationInput,
    @Args('dateRange', { nullable: true }) dateRange?: DateRangeInput,
  ) {
    return this.transactionService.findAll({
      organisationId,
      branchId,
      userId,
      type,
      fundId,
      eventId,
      skip: paginationInput?.skip,
      take: paginationInput?.take,
      dateRange,
    });
  }

  @Query(() => Transaction, { name: 'transaction' })
  findOne(@Args('id', { type: () => ID }) id: string) {
    return this.transactionService.findOne(id);
  }

  @Mutation(() => Transaction)
  updateTransaction(@Args('input') input: UpdateTransactionInput) {
    return this.transactionService.update(input.id, input);
  }

  @Mutation(() => Transaction)
  removeTransaction(@Args('id', { type: () => ID }) id: string) {
    return this.transactionService.remove(id);
  }

  @Query(() => TransactionStats, { name: 'transactionStats' })
  getTransactionStats(
    @Args('organisationId', { nullable: true }) organisationId?: string,
    @Args('fundId', { nullable: true }) fundId?: string,
    @Args('branchId', { nullable: true }) branchId?: string,
    @Args('dateRange', { nullable: true }) dateRange?: DateRangeInput,
    /**
     * Optional filter by contribution type ID.
     */
    @Args('contributionTypeId', { nullable: true }) contributionTypeId?: string,
    /**
     * Optional filter by event ID.
     */
    @Args('eventId', { nullable: true }) eventId?: string,
  ) {
    if (!organisationId) {
      throw new Error('organisationId is required for transactionStats');
    }
    return this.transactionService.calculateTransactionStats({
      organisationId,
      branchId,
      fundId,
      dateRange,
      contributionTypeId,
      eventId,
    });
  }

  @Query(() => String, { name: 'exportTransactions' })
  exportTransactions(
    @Args('organisationId') organisationId: string,
    @Args('format', { defaultValue: 'csv' }) format: string,
    @Args('branchId', { nullable: true }) branchId?: string,
    @Args('fundId', { nullable: true }) fundId?: string,
    @Args('eventId', { nullable: true }) eventId?: string,
    @Args('type', { type: () => TransactionType, nullable: true })
    type?: TransactionType,
    @Args('dateRange', { nullable: true }) dateRange?: DateRangeInput,
  ) {
    return this.transactionService.exportTransactions({
      organisationId,
      branchId,
      fundId,
      eventId,
      type,
      dateRange,
      format,
    });
  }

  @Query(() => FinancialStatements, { name: 'financialStatements' })
  getFinancialStatements(@Args('input') input: FinancialStatementsInput) {
    console.log(
      'Resolver getFinancialStatements - Raw input:',
      JSON.stringify(input, null, 2),
    );
    console.log(
      'Resolver getFinancialStatements - organisationId:',
      input.organisationId,
      'type:',
      typeof input.organisationId,
    );
    console.log(
      'Resolver getFinancialStatements - dateRange:',
      input.dateRange,
      'type:',
      typeof input.dateRange,
    );
    console.log(
      'Resolver getFinancialStatements - dateRange.startDate:',
      input.dateRange?.startDate,
      'type:',
      typeof input.dateRange?.startDate,
    );
    console.log(
      'Resolver getFinancialStatements - dateRange.endDate:',
      input.dateRange?.endDate,
      'type:',
      typeof input.dateRange?.endDate,
    );
    return this.transactionService.getFinancialStatements(input);
  }

  @Query(() => BudgetVsActual, { name: 'budgetVsActual' })
  getBudgetVsActual(@Args('input') input: BudgetVsActualInput) {
    return this.transactionService.getBudgetVsActual(input);
  }

  // ==================== ANALYTICS QUERIES ====================

  @Query(() => CashFlowAnalysis, { name: 'cashFlowAnalysis' })
  getCashFlowAnalysis(@Args('input') input: CashFlowAnalysisInput) {
    console.log(
      'Resolver getCashFlowAnalysis - Raw input:',
      JSON.stringify(input, null, 2),
    );
    console.log(
      'Resolver getCashFlowAnalysis - organisationId:',
      input.organisationId,
      'type:',
      typeof input.organisationId,
    );
    console.log(
      'Resolver getCashFlowAnalysis - dateRange:',
      input.dateRange,
      'type:',
      typeof input.dateRange,
    );
    console.log(
      'Resolver getCashFlowAnalysis - dateRange.startDate:',
      input.dateRange?.startDate,
      'type:',
      typeof input.dateRange?.startDate,
    );
    console.log(
      'Resolver getCashFlowAnalysis - dateRange.endDate:',
      input.dateRange?.endDate,
      'type:',
      typeof input.dateRange?.endDate,
    );
    return this.transactionService.getCashFlowAnalysis(input);
  }

  @Query(() => ComparativePeriodAnalysis, { name: 'comparativePeriodAnalysis' })
  getComparativePeriodAnalysis(
    @Args('input') input: ComparativePeriodAnalysisInput,
  ) {
    return this.transactionService.getComparativePeriodAnalysis(input);
  }

  @Query(() => MemberGivingAnalysis, { name: 'memberGivingAnalysis' })
  getMemberGivingAnalysis(@Args('input') input: MemberGivingAnalysisInput) {
    return this.transactionService.getMemberGivingAnalysis(input);
  }

  @ResolveField(() => Fund, { nullable: true })
  async fund(@Parent() transaction: Transaction) {
    if (!transaction.fundId) return null;
    return this.fundsService.findOne(transaction.fundId);
  }

  @ResolveField(() => Event, { nullable: true })
  async event(@Parent() transaction: Transaction) {
    if (!transaction.eventId) return null;
    return this.prisma.event.findUnique({
      where: { id: transaction.eventId },
    });
  }

  // ==================== AUDIT & VOID MUTATIONS ====================

  @Mutation(() => Transaction, { name: 'voidTransaction' })
  voidTransaction(
    @Args('input') input: VoidTransactionInput,
    @Context() context: any,
  ) {
    const userId = context.req?.user?.id || 'system';
    return this.transactionService.voidTransaction(
      input.transactionId,
      userId,
      input.reason,
      input.createReversal ?? true,
    );
  }

  @Mutation(() => Transaction, { name: 'editTransaction' })
  editTransaction(
    @Args('transactionId') transactionId: string,
    @Args('updates') updates: UpdateTransactionInput,
    @Args('reason') reason: string,
    @Context() context: any,
  ) {
    const userId = context.req?.user?.id || 'system';
    const userRole = context.req?.user?.role;
    return this.transactionService.editTransaction(
      transactionId,
      userId,
      updates,
      reason,
      userRole,
    );
  }

  @Query(() => [TransactionAuditLog], { name: 'transactionAuditHistory' })
  getTransactionAuditHistory(@Args('transactionId') transactionId: string) {
    return this.transactionService.getAuditHistory(transactionId);
  }

  @Query(() => Boolean, { name: 'canEditTransaction' })
  async canEditTransaction(
    @Args('transactionId') transactionId: string,
    @Context() context: any,
  ) {
    const transaction = await this.transactionService.findOne(transactionId);
    const userRole = context.req?.user?.role;
    const result = this.transactionService.canEditTransaction(transaction, userRole);
    return result.allowed;
  }

  @Query(() => Boolean, { name: 'canVoidTransaction' })
  async canVoidTransaction(
    @Args('transactionId') transactionId: string,
    @Context() context: any,
  ) {
    const transaction = await this.transactionService.findOne(transactionId);
    const userRole = context.req?.user?.role;
    const result = this.transactionService.canVoidTransaction(transaction, userRole);
    return result.allowed;
  }

  @Query(() => [Transaction], { name: 'voidedTransactions' })
  getVoidedTransactions(
    @Args('organisationId') organisationId: string,
    @Args('branchId', { nullable: true }) branchId?: string,
    @Args('startDate', { nullable: true }) startDate?: Date,
    @Args('endDate', { nullable: true }) endDate?: Date,
  ) {
    return this.transactionService.getVoidedTransactions({
      organisationId,
      branchId,
      startDate,
      endDate,
    });
  }
}
