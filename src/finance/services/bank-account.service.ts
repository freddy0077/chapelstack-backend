import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBankAccountInput } from '../dto/create-bank-account.input';
import { UpdateBankAccountInput } from '../dto/update-bank-account.input';
import { BankAccountEntity } from '../entities/bank-account.entity';
import { BankAuditLogService, AuditLogContext } from './bank-audit-log.service';

@Injectable()
export class BankAccountService {
  constructor(
    private prisma: PrismaService,
    private auditLogService: BankAuditLogService,
  ) {}

  /**
   * Find all bank accounts for a branch
   */
  async findAll(organisationId: string, branchId: string): Promise<BankAccountEntity[]> {
    const bankAccounts = await this.prisma.bankAccount.findMany({
      where: {
        organisationId,
        branchId,
      },
      include: {
        glAccount: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate book balance for each account
    return Promise.all(
      bankAccounts.map(account => this.mapToEntityWithBalance(account))
    );
  }

  /**
   * Find bank account by ID
   */
  async findOne(id: string): Promise<BankAccountEntity> {
    const account = await this.prisma.bankAccount.findUnique({
      where: { id },
      include: {
        glAccount: true,
      },
    });

    if (!account) {
      throw new NotFoundException(`Bank account with ID ${id} not found`);
    }

    return this.mapToEntityWithBalance(account);
  }

  /**
   * Create new bank account
   */
  async create(input: CreateBankAccountInput, auditContext?: AuditLogContext): Promise<BankAccountEntity> {
    // ===== VALIDATION 1: Basic Input Validation =====
    if (!input.organisationId || !input.branchId) {
      throw new BadRequestException('Organization and branch are required');
    }

    if (!input.accountName || input.accountName.trim().length === 0) {
      throw new BadRequestException('Account name is required');
    }

    if (!input.bankName || input.bankName.trim().length === 0) {
      throw new BadRequestException('Bank name is required');
    }

    if (!input.accountNumber || input.accountNumber.trim().length === 0) {
      throw new BadRequestException('Account number is required');
    }

    if (!input.glAccountId) {
      throw new BadRequestException('GL Account is required');
    }

    // ===== VALIDATION 2: Length Validation =====
    if (input.accountName.length > 200) {
      throw new BadRequestException('Account name cannot exceed 200 characters');
    }

    if (input.bankName.length > 200) {
      throw new BadRequestException('Bank name cannot exceed 200 characters');
    }

    if (input.accountNumber.length > 50) {
      throw new BadRequestException('Account number cannot exceed 50 characters');
    }

    // ===== VALIDATION 3: Format Validation =====
    // Account number should be alphanumeric with hyphens
    const accountNumberRegex = /^[A-Za-z0-9\-]+$/;
    if (!accountNumberRegex.test(input.accountNumber)) {
      throw new BadRequestException(
        'Account number can only contain letters, numbers, and hyphens'
      );
    }

    // ===== VALIDATION 4: Enum Validation =====
    const validAccountTypes = ['CHECKING', 'SAVINGS', 'MONEY_MARKET', 'CREDIT_CARD'];
    if (input.accountType && !validAccountTypes.includes(input.accountType)) {
      throw new BadRequestException(
        `Account type must be one of: ${validAccountTypes.join(', ')}`
      );
    }

    const validCurrencies = ['GHS', 'USD', 'EUR', 'GBP'];
    const currency = input.currency || 'GHS';
    if (!validCurrencies.includes(currency)) {
      throw new BadRequestException(
        `Currency must be one of: ${validCurrencies.join(', ')}`
      );
    }

    // ===== VALIDATION 5: GL Account Validation =====
    const glAccount = await this.prisma.account.findUnique({
      where: { id: input.glAccountId },
    });

    if (!glAccount) {
      throw new NotFoundException(`GL Account with ID ${input.glAccountId} not found`);
    }

    // Validate GL account belongs to same organization
    if (glAccount.organisationId !== input.organisationId) {
      throw new BadRequestException(
        'GL Account must belong to the same organization'
      );
    }

    // Validate GL account is active
    if (!glAccount.isActive) {
      throw new BadRequestException('GL Account is inactive');
    }

    // Validate GL account is an ASSET account
    if (glAccount.accountType !== 'ASSET') {
      throw new BadRequestException(
        'GL Account must be an ASSET account'
      );
    }

    // Validate GL account is not already linked to another bank account
    if (glAccount.isBankAccount) {
      throw new BadRequestException(
        'GL Account is already linked to another bank account'
      );
    }

    // ===== VALIDATION 6: Uniqueness Check =====
    const existingByAccountNumber = await this.prisma.bankAccount.findFirst({
      where: {
        accountNumber: input.accountNumber,
        organisationId: input.organisationId,
        branchId: input.branchId,
      },
    });

    if (existingByAccountNumber) {
      throw new BadRequestException(
        `Bank account with number ${input.accountNumber} already exists`
      );
    }

    // Update GL account to mark as bank account
    await this.prisma.account.update({
      where: { id: input.glAccountId },
      data: {
        isBankAccount: true,
      },
    });

    // Create bank account
    const bankAccount = await this.prisma.bankAccount.create({
      data: {
        glAccountId: input.glAccountId,
        accountName: input.accountName,
        bankName: input.bankName,
        accountNumber: input.accountNumber,
        accountType: input.accountType,
        currency: input.currency || 'GHS',
        organisationId: input.organisationId,
        branchId: input.branchId,
      },
      include: {
        glAccount: true,
      },
    });

    // Update GL account with bank account ID
    await this.prisma.account.update({
      where: { id: input.glAccountId },
      data: {
        bankAccountId: bankAccount.id,
      },
    });

    // Log audit trail
    if (auditContext) {
      await this.auditLogService.logBankAccountCreate(
        bankAccount.id,
        {
          accountName: bankAccount.accountName,
          bankName: bankAccount.bankName,
          accountNumber: bankAccount.accountNumber,
          accountType: bankAccount.accountType,
          currency: bankAccount.currency,
        },
        auditContext,
      );
    }

    return this.mapToEntityWithBalance(bankAccount);
  }

  /**
   * Update bank account details
   */
  async update(id: string, input: UpdateBankAccountInput): Promise<BankAccountEntity> {
    // Verify bank account exists
    const existingAccount = await this.prisma.bankAccount.findUnique({
      where: { id },
    });

    if (!existingAccount) {
      throw new NotFoundException(`Bank account with ID ${id} not found`);
    }

    // Validate inputs if provided
    if (input.accountName && input.accountName.trim().length === 0) {
      throw new BadRequestException('Account name cannot be empty');
    }

    if (input.bankName && input.bankName.trim().length === 0) {
      throw new BadRequestException('Bank name cannot be empty');
    }

    if (input.accountNumber && input.accountNumber.trim().length === 0) {
      throw new BadRequestException('Account number cannot be empty');
    }

    // Validate account number format if provided
    if (input.accountNumber) {
      const accountNumberRegex = /^[A-Za-z0-9\-]+$/;
      if (!accountNumberRegex.test(input.accountNumber)) {
        throw new BadRequestException(
          'Account number can only contain letters, numbers, and hyphens'
        );
      }

      // Check uniqueness if account number is being changed
      if (input.accountNumber !== existingAccount.accountNumber) {
        const duplicate = await this.prisma.bankAccount.findFirst({
          where: {
            accountNumber: input.accountNumber,
            organisationId: existingAccount.organisationId,
            branchId: existingAccount.branchId,
            id: { not: id },
          },
        });

        if (duplicate) {
          throw new BadRequestException(
            `Bank account with number ${input.accountNumber} already exists`
          );
        }
      }
    }

    // Validate account type if provided
    if (input.accountType) {
      const validAccountTypes = ['CHECKING', 'SAVINGS', 'MONEY_MARKET', 'CREDIT_CARD'];
      if (!validAccountTypes.includes(input.accountType)) {
        throw new BadRequestException(
          `Account type must be one of: ${validAccountTypes.join(', ')}`
        );
      }
    }

    // Validate currency if provided
    if (input.currency) {
      const validCurrencies = ['GHS', 'USD', 'EUR', 'GBP'];
      if (!validCurrencies.includes(input.currency)) {
        throw new BadRequestException(
          `Currency must be one of: ${validCurrencies.join(', ')}`
        );
      }
    }

    // Update bank account
    const account = await this.prisma.bankAccount.update({
      where: { id },
      data: {
        accountName: input.accountName,
        bankName: input.bankName,
        accountNumber: input.accountNumber,
        accountType: input.accountType,
        currency: input.currency,
      },
      include: {
        glAccount: true,
      },
    });

    return this.mapToEntityWithBalance(account);
  }

  /**
   * Update bank balance from bank statement
   */
  async updateBankBalance(id: string, bankBalance: number): Promise<BankAccountEntity> {
    // ===== VALIDATION: Amount Validation =====
    if (isNaN(bankBalance)) {
      throw new BadRequestException('Bank balance must be a valid number');
    }

    // Allow negative balances (overdraft) but validate reasonable limits
    const MAX_BALANCE = 1000000000.00; // 1 billion
    const MIN_BALANCE = -10000000.00; // -10 million (overdraft limit)

    if (bankBalance > MAX_BALANCE) {
      throw new BadRequestException(
        `Bank balance exceeds maximum allowed (${MAX_BALANCE})`
      );
    }

    if (bankBalance < MIN_BALANCE) {
      throw new BadRequestException(
        `Bank balance below minimum allowed (${MIN_BALANCE})`
      );
    }

    // Validate precision (max 2 decimal places)
    const decimals = (bankBalance.toString().split('.')[1] || '').length;
    if (decimals > 2) {
      throw new BadRequestException(
        'Bank balance cannot have more than 2 decimal places'
      );
    }

    // Verify bank account exists
    const existingAccount = await this.prisma.bankAccount.findUnique({
      where: { id },
    });

    if (!existingAccount) {
      throw new NotFoundException(`Bank account with ID ${id} not found`);
    }

    const account = await this.prisma.bankAccount.update({
      where: { id },
      data: {
        bankBalance,
      },
      include: {
        glAccount: true,
      },
    });

    return this.mapToEntityWithBalance(account);
  }

  /**
   * Deactivate bank account
   */
  async deactivate(id: string): Promise<BankAccountEntity> {
    const account = await this.prisma.bankAccount.update({
      where: { id },
      data: {
        status: 'INACTIVE',
      },
      include: {
        glAccount: true,
      },
    });

    return this.mapToEntityWithBalance(account);
  }

  /**
   * Calculate book balance from journal entries
   */
  private async calculateBookBalance(glAccountId: string): Promise<number> {
    const balanceData = await this.prisma.journalEntryLine.aggregate({
      where: {
        accountId: glAccountId,
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
    
    // For asset accounts (bank accounts), balance = debits - credits
    return totalDebits - totalCredits;
  }

  /**
   * Map Prisma model to GraphQL entity with calculated book balance
   */
  private async mapToEntityWithBalance(account: any): Promise<BankAccountEntity> {
    const glAccount = account.glAccount;
    
    // Calculate book balance from journal entries
    const bookBalance = await this.calculateBookBalance(account.glAccountId);
    const bankBalance = Number(account.bankBalance || 0);
    const difference = bankBalance - bookBalance;

    return {
      id: account.id,
      glAccountId: account.glAccountId,
      glAccountCode: glAccount?.accountCode || '',
      glAccountName: glAccount?.accountName || '',
      accountName: account.accountName,
      bankName: account.bankName,
      accountNumber: account.accountNumber,
      accountType: account.accountType,
      currency: account.currency,
      bankBalance: bankBalance,
      bookBalance,
      difference,
      lastReconciled: account.lastReconciled,
      status: account.status,
      isReconciled: Math.abs(difference) < 0.01,
      organisationId: account.organisationId,
      branchId: account.branchId,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    };
  }

  /**
   * Map Prisma model to GraphQL entity (synchronous version for compatibility)
   */
  private mapToEntity(account: any): BankAccountEntity {
    const glAccount = account.glAccount;
    
    // Note: This is a synchronous fallback. Use mapToEntityWithBalance for accurate balance
    const bookBalance = 0;
    const bankBalance = Number(account.bankBalance || 0);
    const difference = bankBalance - bookBalance;

    return {
      id: account.id,
      glAccountId: account.glAccountId,
      glAccountCode: glAccount?.accountCode || '',
      glAccountName: glAccount?.accountName || '',
      accountName: account.accountName,
      bankName: account.bankName,
      accountNumber: account.accountNumber,
      accountType: account.accountType,
      currency: account.currency,
      bankBalance: bankBalance,
      bookBalance,
      difference,
      lastReconciled: account.lastReconciled,
      status: account.status,
      isReconciled: Math.abs(difference) < 0.01,
      organisationId: account.organisationId,
      branchId: account.branchId,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    };
  }
}
