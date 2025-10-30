import { Resolver, Query, Mutation, Args, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { BankAccountService } from '../services/bank-account.service';
import { CreateBankAccountInput } from '../dto/create-bank-account.input';
import { UpdateBankAccountInput } from '../dto/update-bank-account.input';
import { BankAccountEntity } from '../entities/bank-account.entity';
import { AccountEntity } from '../entities/account.entity';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * BankAccountResolver
 * GraphQL resolver for bank account operations
 */
@Resolver(() => BankAccountEntity)
export class BankAccountResolver {
  constructor(
    private readonly bankAccountService: BankAccountService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Get all bank accounts for a branch
   */
  @Query(() => [BankAccountEntity])
  async bankAccounts(
    @Args('organisationId') organisationId: string,
    @Args('branchId') branchId: string,
  ): Promise<BankAccountEntity[]> {
    return this.bankAccountService.findAll(organisationId, branchId);
  }

  /**
   * Get bank account by ID
   */
  @Query(() => BankAccountEntity)
  async bankAccount(@Args('id') id: string): Promise<BankAccountEntity> {
    return this.bankAccountService.findOne(id);
  }

  /**
   * Create new bank account
   */
  @Mutation(() => BankAccountEntity)
  async createBankAccount(
    @Args('input') input: CreateBankAccountInput,
    @CurrentUser() user: any,
  ): Promise<BankAccountEntity> {
    return this.bankAccountService.create(input);
  }

  /**
   * Update bank balance (from bank statement)
   */
  @Mutation(() => BankAccountEntity)
  async updateBankBalance(
    @Args('id') id: string,
    @Args('bankBalance') bankBalance: number,
  ): Promise<BankAccountEntity> {
    return this.bankAccountService.updateBankBalance(id, bankBalance);
  }

  /**
   * Update bank account
   */
  @Mutation(() => BankAccountEntity)
  async updateBankAccount(
    @Args('id') id: string,
    @Args('input') input: UpdateBankAccountInput,
    @CurrentUser() user: any,
  ): Promise<BankAccountEntity> {
    return this.bankAccountService.update(id, input);
  }

  /**
   * Deactivate bank account
   */
  @Mutation(() => BankAccountEntity)
  async deactivateBankAccount(
    @Args('id') id: string,
    @CurrentUser() user: any,
  ): Promise<BankAccountEntity> {
    return this.bankAccountService.deactivate(id);
  }

  /**
   * Resolve glAccount field with balance
   */
  @ResolveField(() => AccountEntity, { nullable: true })
  async glAccount(@Parent() bankAccount: BankAccountEntity): Promise<AccountEntity | null> {
    // Fetch the GL account
    const account = await this.prisma.account.findUnique({
      where: { id: bankAccount.glAccountId },
    });

    if (!account) {
      return null;
    }

    // Calculate balance from journal entries
    const balanceData = await this.prisma.journalEntryLine.aggregate({
      where: {
        accountId: account.id,
        journalEntry: {
          status: 'POSTED',
        },
      },
      _sum: {
        debitAmount: true,
        creditAmount: true,
      },
    });

    const totalDebits = Number(balanceData._sum.debitAmount || 0);
    const totalCredits = Number(balanceData._sum.creditAmount || 0);
    const balance = totalDebits - totalCredits;

    return {
      ...account,
      balance,
    };
  }
}
