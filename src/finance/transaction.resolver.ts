import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { TransactionService } from './transaction.service';
import { Transaction } from './entities/transaction.entity';
import { CreateTransactionInput } from './dto/create-transaction.input';
import { UpdateTransactionInput } from './dto/update-transaction.input';
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

registerEnumType(TransactionType, {
  name: 'TransactionType',
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
  async exportTransactions(
    @Args('exportFormat', { nullable: false }) exportFormat: string,
    @Args('organisationId', { nullable: true }) organisationId?: string,
    @Args('branchId', { nullable: true }) branchId?: string,
    @Args('fundId', { nullable: true }) fundId?: string,
    @Args('eventId', { nullable: true }) eventId?: string,
    @Args('type', { type: () => TransactionType, nullable: true })
    type?: TransactionType,
    @Args('dateRange', { nullable: true }) dateRange?: DateRangeInput,
    @Args('searchTerm', { nullable: true }) searchTerm?: string,
  ): Promise<string> {
    return this.transactionService.exportTransactions({
      organisationId,
      branchId,
      fundId,
      eventId,
      type,
      dateRange,
      searchTerm,
      exportFormat,
    });
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
}
