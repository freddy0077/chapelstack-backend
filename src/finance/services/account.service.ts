import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Account, AccountType, Prisma } from '@prisma/client';

/**
 * AccountService
 * Manages Chart of Accounts (COA)
 * Branch-level service
 */
@Injectable()
export class AccountService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get Chart of Accounts for a branch
   */
  async getChartOfAccounts(
    organisationId: string,
    branchId: string,
    accountType?: AccountType,
  ): Promise<Account[]> {
    const where: Prisma.AccountWhereInput = {
      organisationId,
      branchId,
      isActive: true,
    };

    if (accountType) {
      where.accountType = accountType;
    }

    return this.prisma.account.findMany({
      where,
      include: {
        subAccounts: true,
        parentAccount: true,
        fund: true,
        ministry: true,
      },
      orderBy: {
        accountCode: 'asc',
      },
    });
  }

  /**
   * Get account by code
   */
  async getAccountByCode(
    accountCode: string,
    organisationId: string,
    branchId: string,
  ): Promise<Account> {
    const account = await this.prisma.account.findFirst({
      where: {
        accountCode,
        organisationId,
        branchId,
      },
      include: {
        subAccounts: true,
        parentAccount: true,
        fund: true,
        ministry: true,
      },
    });

    if (!account) {
      throw new NotFoundException(
        `Account with code ${accountCode} not found`,
      );
    }

    return account;
  }

  /**
   * Get account by ID
   */
  async getAccountById(id: string): Promise<Account> {
    const account = await this.prisma.account.findUnique({
      where: { id },
      include: {
        subAccounts: true,
        parentAccount: true,
        fund: true,
        ministry: true,
      },
    });

    if (!account) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }

    return account;
  }

  /**
   * Create new account
   */
  async createAccount(
    data: any,
    organisationId: string,
    branchId: string,
    createdBy: string,
  ): Promise<Account> {
    // ===== VALIDATION 1: Basic Input Validation =====
    if (!organisationId || !branchId) {
      throw new BadRequestException('Organization and branch are required');
    }

    if (!data.accountCode || data.accountCode.trim().length === 0) {
      throw new BadRequestException('Account code is required');
    }

    if (!data.accountName || data.accountName.trim().length === 0) {
      throw new BadRequestException('Account name is required');
    }

    if (!data.accountType) {
      throw new BadRequestException('Account type is required');
    }

    if (!data.normalBalance) {
      throw new BadRequestException('Normal balance is required');
    }

    // ===== VALIDATION 2: Length Validation =====
    if (data.accountCode.length > 20) {
      throw new BadRequestException('Account code cannot exceed 20 characters');
    }

    if (data.accountName.length > 200) {
      throw new BadRequestException('Account name cannot exceed 200 characters');
    }

    if (data.description && data.description.length > 500) {
      throw new BadRequestException('Description cannot exceed 500 characters');
    }

    if (data.notes && data.notes.length > 1000) {
      throw new BadRequestException('Notes cannot exceed 1000 characters');
    }

    // ===== VALIDATION 3: Format Validation =====
    // Account code should be alphanumeric with hyphens/underscores
    const accountCodeRegex = /^[A-Za-z0-9\-_]+$/;
    if (!accountCodeRegex.test(data.accountCode)) {
      throw new BadRequestException(
        'Account code can only contain letters, numbers, hyphens, and underscores'
      );
    }

    // ===== VALIDATION 4: Enum Validation =====
    const validAccountTypes = ['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE'];
    if (!validAccountTypes.includes(data.accountType)) {
      throw new BadRequestException(
        `Account type must be one of: ${validAccountTypes.join(', ')}`
      );
    }

    const validBalanceTypes = ['DEBIT', 'CREDIT'];
    if (!validBalanceTypes.includes(data.normalBalance)) {
      throw new BadRequestException(
        `Normal balance must be either DEBIT or CREDIT`
      );
    }

    // ===== VALIDATION 5: Business Logic Validation =====
    // Validate normal balance matches account type
    const debitAccounts = ['ASSET', 'EXPENSE'];
    const creditAccounts = ['LIABILITY', 'EQUITY', 'REVENUE'];

    if (debitAccounts.includes(data.accountType) && data.normalBalance !== 'DEBIT') {
      throw new BadRequestException(
        `${data.accountType} accounts must have DEBIT normal balance`
      );
    }

    if (creditAccounts.includes(data.accountType) && data.normalBalance !== 'CREDIT') {
      throw new BadRequestException(
        `${data.accountType} accounts must have CREDIT normal balance`
      );
    }

    // ===== VALIDATION 6: Parent Account Validation =====
    if (data.parentAccountId) {
      const parentAccount = await this.prisma.account.findUnique({
        where: { id: data.parentAccountId },
      });

      if (!parentAccount) {
        throw new BadRequestException('Parent account not found');
      }

      if (parentAccount.organisationId !== organisationId) {
        throw new BadRequestException(
          'Parent account must belong to the same organization'
        );
      }

      if (parentAccount.accountType !== data.accountType) {
        throw new BadRequestException(
          'Parent account must have the same account type'
        );
      }

      if (!parentAccount.isActive) {
        throw new BadRequestException('Parent account is inactive');
      }
    }

    // ===== VALIDATION 7: Uniqueness Check =====
    const existing = await this.prisma.account.findFirst({
      where: {
        accountCode: data.accountCode,
        organisationId,
        branchId,
      },
    });

    if (existing) {
      throw new BadRequestException(
        `Account with code ${data.accountCode} already exists`,
      );
    }

    return this.prisma.account.create({
      data: {
        accountCode: data.accountCode,
        accountName: data.accountName,
        accountType: data.accountType,
        accountSubType: data.accountSubType,
        normalBalance: data.normalBalance,
        description: data.description,
        notes: data.notes,
        parentAccountId: data.parentAccountId,
        fundId: data.fundId,
        ministryId: data.ministryId,
        isRestricted: data.isRestricted,
        currency: data.currency || 'GHS',
        isActive: true,
        isSystemAccount: false,
        organisation: {
          connect: { id: organisationId },
        },
        branch: {
          connect: { id: branchId },
        },
        createdBy,
      },
      include: {
        subAccounts: true,
        parentAccount: true,
        fund: true,
        ministry: true,
      },
    });
  }

  /**
   * Update account
   */
  async updateAccount(
    id: string,
    data: Prisma.AccountUpdateInput,
    updatedBy: string,
  ): Promise<Account> {
    const account = await this.getAccountById(id);

    // Prevent updating system accounts
    if (account.isSystemAccount) {
      throw new BadRequestException('Cannot update system account');
    }

    return this.prisma.account.update({
      where: { id },
      data: {
        ...data,
        updatedBy,
        updatedAt: new Date(),
      },
      include: {
        subAccounts: true,
        parentAccount: true,
        fund: true,
        ministry: true,
      },
    });
  }

  /**
   * Deactivate account (soft delete)
   */
  async deactivateAccount(id: string, updatedBy: string): Promise<Account> {
    const account = await this.getAccountById(id);

    // Prevent deactivating system accounts
    if (account.isSystemAccount) {
      throw new BadRequestException('Cannot deactivate system account');
    }

    // Check if account has sub-accounts
    const subAccounts = await this.prisma.account.count({
      where: {
        parentAccountId: id,
        isActive: true,
      },
    });

    if (subAccounts > 0) {
      throw new BadRequestException(
        'Cannot deactivate account with active sub-accounts',
      );
    }

    return this.prisma.account.update({
      where: { id },
      data: {
        isActive: false,
        updatedBy,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Get account balance
   * Calculates balance from journal entry lines
   */
  async getAccountBalance(
    accountId: string,
    asOfDate?: Date,
  ): Promise<{
    accountId: string;
    debitTotal: number;
    creditTotal: number;
    balance: number;
  }> {
    const account = await this.getAccountById(accountId);

    const where: Prisma.JournalEntryLineWhereInput = {
      accountId,
      journalEntry: asOfDate
        ? {
            status: 'POSTED',
            postingDate: {
              lte: asOfDate,
            },
          }
        : {
            status: 'POSTED',
          },
    };

    const lines = await this.prisma.journalEntryLine.findMany({
      where,
      select: {
        debitAmount: true,
        creditAmount: true,
      },
    });

    const debitTotal = lines.reduce(
      (sum, line) => sum + Number(line.debitAmount),
      0,
    );
    const creditTotal = lines.reduce(
      (sum, line) => sum + Number(line.creditAmount),
      0,
    );

    // Calculate balance based on normal balance
    let balance: number;
    if (account.normalBalance === 'DEBIT') {
      balance = debitTotal - creditTotal;
    } else {
      balance = creditTotal - debitTotal;
    }

    return {
      accountId,
      debitTotal,
      creditTotal,
      balance,
    };
  }

  /**
   * Get account hierarchy (parent and all children)
   */
  async getAccountHierarchy(
    accountId: string,
  ): Promise<Account & { children: Account[] }> {
    const account = await this.getAccountById(accountId);

    const children = await this.prisma.account.findMany({
      where: {
        parentAccountId: accountId,
        isActive: true,
      },
      include: {
        subAccounts: true,
      },
      orderBy: {
        accountCode: 'asc',
      },
    });

    return {
      ...account,
      children,
    };
  }

  /**
   * Get trial balance
   * Lists all accounts with their balances
   */
  async getTrialBalance(
    organisationId: string,
    branchId: string,
    fiscalYear: number,
    fiscalPeriod: number,
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
    const accounts = await this.getChartOfAccounts(
      organisationId,
      branchId,
    );

    const accountBalances = await Promise.all(
      accounts.map(async (account) => {
        const balance = await this.getAccountBalance(account.id);
        
        return {
          accountCode: account.accountCode,
          accountName: account.accountName,
          accountType: account.accountType,
          debitBalance: account.normalBalance === 'DEBIT' && balance.balance > 0 ? balance.balance : 0,
          creditBalance: account.normalBalance === 'CREDIT' && balance.balance > 0 ? balance.balance : 0,
        };
      }),
    );

    const totalDebits = accountBalances.reduce(
      (sum, acc) => sum + acc.debitBalance,
      0,
    );
    const totalCredits = accountBalances.reduce(
      (sum, acc) => sum + acc.creditBalance,
      0,
    );

    return {
      accounts: accountBalances,
      totalDebits,
      totalCredits,
      isBalanced: Math.abs(totalDebits - totalCredits) < 0.01, // Allow for rounding
    };
  }
}
