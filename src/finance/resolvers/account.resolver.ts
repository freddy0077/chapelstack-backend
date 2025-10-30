import { Resolver, Query, Mutation, Args, ObjectType, Field, Float } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';
import { UseGuards } from '@nestjs/common';
import { AccountService } from '../services/account.service';
import { AccountType } from '@prisma/client';
import {
  CreateAccountInput,
  UpdateAccountInput,
  GetChartOfAccountsInput,
} from '../dto/account.input';
import { AccountEntity } from '../entities/account.entity';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@ObjectType()
class AccountBalanceType {
  @Field()
  accountId: string;

  @Field(() => Float)
  debitTotal: number;

  @Field(() => Float)
  creditTotal: number;

  @Field(() => Float)
  balance: number;
}

/**
 * AccountResolver
 * GraphQL resolver for Chart of Accounts operations
 */
@Resolver('Account')
export class AccountResolver {
  constructor(private readonly accountService: AccountService) {}

  /**
   * Get Chart of Accounts
   */
  @Query(() => [AccountEntity])
  async chartOfAccounts(
    @Args('input') input: GetChartOfAccountsInput,
  ): Promise<AccountEntity[]> {
    return this.accountService.getChartOfAccounts(
      input.organisationId,
      input.branchId,
      input.accountType,
    );
  }

  /**
   * Get account by code
   */
  @Query(() => AccountEntity)
  async accountByCode(
    @Args('accountCode') accountCode: string,
    @Args('organisationId') organisationId: string,
    @Args('branchId') branchId: string,
  ): Promise<AccountEntity> {
    return this.accountService.getAccountByCode(
      accountCode,
      organisationId,
      branchId,
    );
  }

  /**
   * Get account by ID
   */
  @Query(() => AccountEntity)
  async account(@Args('id') id: string): Promise<AccountEntity> {
    return this.accountService.getAccountById(id);
  }

  /**
   * Get account balance
   */
  @Query(() => AccountBalanceType)
  async accountBalance(
    @Args('accountId') accountId: string,
    @Args('asOfDate', { nullable: true }) asOfDate?: Date,
  ): Promise<AccountBalanceType> {
    return this.accountService.getAccountBalance(accountId, asOfDate);
  }

  /**
   * Get account hierarchy
   */
  @Query(() => GraphQLJSON)
  async accountHierarchy(
    @Args('accountId') accountId: string,
  ): Promise<any> {
    return this.accountService.getAccountHierarchy(accountId);
  }

  /**
   * Get trial balance
   */
  @Query(() => GraphQLJSON)
  async trialBalance(
    @Args('organisationId') organisationId: string,
    @Args('branchId') branchId: string,
    @Args('fiscalYear') fiscalYear: number,
    @Args('fiscalPeriod') fiscalPeriod: number,
  ): Promise<{
    accounts: Array<{
      accountCode: string;
      accountName: string;
      accountType: string;
      debitBalance: number;
      creditBalance: number;
    }>;
    totalDebits: number;
    totalCredits: number;
    isBalanced: boolean;
  }> {
    return this.accountService.getTrialBalance(
      organisationId,
      branchId,
      fiscalYear,
      fiscalPeriod,
    );
  }

  /**
   * Create account
   */
  @Mutation(() => AccountEntity)
  async createAccount(
    @Args('input') input: CreateAccountInput,
  ): Promise<AccountEntity> {
    return this.accountService.createAccount(
      input as any,
      input.organisationId,
      input.branchId,
      input.createdBy,
    );
  }

  /**
   * Update account
   */
  @Mutation(() => AccountEntity)
  async updateAccount(
    @Args('id') id: string,
    @Args('input') input: UpdateAccountInput,
    @CurrentUser() user: any,
  ): Promise<AccountEntity> {
    return this.accountService.updateAccount(id, input as any, user?.id || 'system');
  }

  /**
   * Deactivate account
   */
  @Mutation(() => AccountEntity)
  async deactivateAccount(
    @Args('id') id: string,
    @CurrentUser() user: any,
  ): Promise<AccountEntity> {
    return this.accountService.deactivateAccount(id, user?.id || 'system');
  }
}
