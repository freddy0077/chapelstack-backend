import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SaveBankReconciliationInput } from '../dto/save-bank-reconciliation.input';
import { BankReconciliationEntity } from '../entities/bank-reconciliation.entity';

@Injectable()
export class BankReconciliationService {
  constructor(private prisma: PrismaService) {}

  /**
   * Find reconciliations by bank account
   */
  async findByBankAccount(bankAccountId: string): Promise<BankReconciliationEntity[]> {
    return this.prisma.bankReconciliation.findMany({
      where: { bankAccountId },
      orderBy: { reconciliationDate: 'desc' },
    });
  }

  /**
   * Find reconciliation by ID
   */
  async findOne(id: string): Promise<BankReconciliationEntity> {
    const reconciliation = await this.prisma.bankReconciliation.findUnique({
      where: { id },
    });

    if (!reconciliation) {
      throw new NotFoundException(`Bank reconciliation with ID ${id} not found`);
    }

    return reconciliation;
  }

  /**
   * Save bank reconciliation
   */
  async save(input: SaveBankReconciliationInput, userId: string): Promise<BankReconciliationEntity> {
    // ===== VALIDATION 1: Basic Input Validation =====
    if (!input.accountId) {
      throw new BadRequestException('Bank account ID is required');
    }

    if (!input.reconciliationDate) {
      throw new BadRequestException('Reconciliation date is required');
    }

    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    // ===== VALIDATION 2: Date Validation =====
    const reconciliationDate = new Date(input.reconciliationDate);
    reconciliationDate.setHours(0, 0, 0, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (reconciliationDate > today) {
      throw new BadRequestException('Reconciliation date cannot be in the future');
    }

    // Check if date is too old (more than 2 years)
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
    if (reconciliationDate < twoYearsAgo) {
      throw new BadRequestException(
        'Reconciliation date cannot be more than 2 years in the past'
      );
    }

    // ===== VALIDATION 3: Amount Validation =====
    const validateAmount = (amount: number, name: string) => {
      if (isNaN(amount)) {
        throw new BadRequestException(`${name} must be a valid number`);
      }

      const MAX_AMOUNT = 1000000000.00; // 1 billion
      const MIN_AMOUNT = -10000000.00; // -10 million (overdraft)

      if (amount > MAX_AMOUNT) {
        throw new BadRequestException(
          `${name} exceeds maximum allowed (${MAX_AMOUNT})`
        );
      }

      if (amount < MIN_AMOUNT) {
        throw new BadRequestException(
          `${name} below minimum allowed (${MIN_AMOUNT})`
        );
      }

      // Validate precision (max 2 decimal places)
      const decimals = (amount.toString().split('.')[1] || '').length;
      if (decimals > 2) {
        throw new BadRequestException(
          `${name} cannot have more than 2 decimal places`
        );
      }
    };

    validateAmount(input.bankStatementBalance, 'Bank statement balance');
    validateAmount(input.bookBalance, 'Book balance');
    validateAmount(input.adjustedBalance, 'Adjusted balance');
    validateAmount(input.difference, 'Difference');

    // ===== VALIDATION 4: Business Logic Validation =====
    // Verify difference calculation is correct
    const calculatedDifference = input.bankStatementBalance - input.bookBalance;
    if (Math.abs(calculatedDifference - input.difference) > 0.01) {
      throw new BadRequestException(
        `Difference calculation incorrect. Expected: ${calculatedDifference.toFixed(2)}, Got: ${input.difference.toFixed(2)}`
      );
    }

    // ===== VALIDATION 5: Status Validation =====
    const validStatuses = ['RECONCILED', 'PENDING', 'VOIDED'];
    if (input.status && !validStatuses.includes(input.status)) {
      throw new BadRequestException(
        `Status must be one of: ${validStatuses.join(', ')}`
      );
    }

    // ===== VALIDATION 6: Notes Length =====
    if (input.notes && input.notes.length > 2000) {
      throw new BadRequestException('Notes cannot exceed 2000 characters');
    }

    // ===== VALIDATION 7: Bank Account Validation =====
    const bankAccount = await this.prisma.bankAccount.findUnique({
      where: { id: input.accountId },
    });

    if (!bankAccount) {
      throw new NotFoundException(`Bank account with ID ${input.accountId} not found`);
    }

    // Validate bank account is active
    if (bankAccount.status === 'INACTIVE') {
      throw new BadRequestException('Cannot reconcile inactive bank account');
    }

    // ===== VALIDATION 9: Book Balance Verification =====
    // Calculate actual book balance from GL account journal entries
    const glAccountBalance = await this.prisma.journalEntryLine.aggregate({
      where: {
        accountId: bankAccount.glAccountId,
        journalEntry: {
          status: 'POSTED',
        },
      },
      _sum: {
        debitAmount: true,
        creditAmount: true,
      },
    });

    // Calculate net balance (debits - credits for asset accounts)
    const totalDebits = Number(glAccountBalance._sum.debitAmount || 0);
    const totalCredits = Number(glAccountBalance._sum.creditAmount || 0);
    const actualBookBalance = totalDebits - totalCredits;
    const providedBookBalance = Number(input.bookBalance);
    
    // Allow small rounding differences (1 cent)
    if (Math.abs(actualBookBalance - providedBookBalance) > 0.01) {
      throw new BadRequestException(
        `Book balance mismatch. GL Account Balance: ${actualBookBalance.toFixed(2)}, Provided: ${providedBookBalance.toFixed(2)}`
      );
    }

    // ===== VALIDATION 10: Large Variance Detection =====
    // Check for large variance from last reconciliation
    const lastReconciliation = await this.prisma.bankReconciliation.findFirst({
      where: {
        bankAccountId: input.accountId,
        status: { not: 'VOIDED' },
      },
      orderBy: { reconciliationDate: 'desc' },
    });

    if (lastReconciliation) {
      const lastBankBalance = Number(lastReconciliation.bankStatementBalance);
      const currentBankBalance = Number(input.bankStatementBalance);
      const variance = Math.abs(currentBankBalance - lastBankBalance);
      const variancePercent = lastBankBalance !== 0 
        ? (variance / Math.abs(lastBankBalance)) * 100 
        : 0;

      // Alert if variance is greater than 50%
      if (variancePercent > 50) {
        throw new BadRequestException(
          `Bank balance variance too large (${variancePercent.toFixed(1)}%). ` +
          `Last: ${lastBankBalance.toFixed(2)}, Current: ${currentBankBalance.toFixed(2)}. ` +
          `Please verify the bank statement balance.`
        );
      }
    }

    // ===== VALIDATION 8: Check for Duplicate Reconciliation =====
    // Prevent reconciling the same date twice
    const existingReconciliation = await this.prisma.bankReconciliation.findFirst({
      where: {
        bankAccountId: input.accountId,
        reconciliationDate: reconciliationDate,
        status: { not: 'VOIDED' },
      },
    });

    if (existingReconciliation) {
      throw new BadRequestException(
        `A reconciliation already exists for this date. Please void the existing one first.`
      );
    }

    // ===== USE DATABASE TRANSACTION FOR ATOMICITY =====
    // Create reconciliation and update bank account atomically
    return await this.prisma.$transaction(async (tx) => {
      // Create reconciliation record
      const reconciliation = await tx.bankReconciliation.create({
        data: {
          bankAccountId: input.accountId,
          reconciliationDate: new Date(input.reconciliationDate),
          bankStatementBalance: input.bankStatementBalance,
          bookBalance: input.bookBalance,
          adjustedBalance: input.adjustedBalance,
          difference: input.difference,
          clearedTransactions: input.clearedTransactions,
          notes: input.notes,
          reconciledBy: input.reconciledBy || userId,
          preparedBy: userId, // Track who prepared it
          status: (input.status as any) || 'DRAFT', // Default to DRAFT
          bankStatementFileUrl: input.bankStatementFileUrl, // Supporting document
          organisationId: bankAccount.organisationId,
          branchId: bankAccount.branchId,
        },
      });

      // Only update bank account if reconciliation is approved/reconciled
      if (input.status === 'RECONCILED' || input.status === 'APPROVED') {
        await tx.bankAccount.update({
          where: { id: input.accountId },
          data: {
            lastReconciled: new Date(input.reconciliationDate),
            bankBalance: input.bankStatementBalance,
          },
        });
      }

      return reconciliation;
    });
  }

  /**
   * Submit reconciliation for review
   */
  async submitForReview(id: string, userId: string): Promise<BankReconciliationEntity> {
    const reconciliation = await this.prisma.bankReconciliation.findUnique({
      where: { id },
    });

    if (!reconciliation) {
      throw new NotFoundException(`Reconciliation with ID ${id} not found`);
    }

    if (reconciliation.status !== 'DRAFT') {
      throw new BadRequestException('Only draft reconciliations can be submitted for review');
    }

    return await this.prisma.bankReconciliation.update({
      where: { id },
      data: {
        status: 'PENDING_REVIEW',
      },
    });
  }

  /**
   * Approve reconciliation (Maker-Checker)
   */
  async approve(id: string, userId: string): Promise<BankReconciliationEntity> {
    const reconciliation = await this.prisma.bankReconciliation.findUnique({
      where: { id },
    });

    if (!reconciliation) {
      throw new NotFoundException(`Reconciliation with ID ${id} not found`);
    }

    if (reconciliation.status !== 'PENDING_REVIEW') {
      throw new BadRequestException('Only reconciliations pending review can be approved');
    }

    // Maker-Checker: Approver cannot be the preparer
    if (reconciliation.preparedBy === userId) {
      throw new BadRequestException('You cannot approve a reconciliation you prepared');
    }

    return await this.prisma.$transaction(async (tx) => {
      // Update reconciliation status
      const approved = await tx.bankReconciliation.update({
        where: { id },
        data: {
          status: 'APPROVED',
          approvedBy: userId,
          approvedAt: new Date(),
        },
      });

      // Update bank account with reconciled balance
      await tx.bankAccount.update({
        where: { id: reconciliation.bankAccountId },
        data: {
          lastReconciled: reconciliation.reconciliationDate,
          bankBalance: reconciliation.bankStatementBalance,
        },
      });

      return approved;
    });
  }

  /**
   * Reject reconciliation
   */
  async reject(id: string, userId: string, reason: string): Promise<BankReconciliationEntity> {
    const reconciliation = await this.prisma.bankReconciliation.findUnique({
      where: { id },
    });

    if (!reconciliation) {
      throw new NotFoundException(`Reconciliation with ID ${id} not found`);
    }

    if (reconciliation.status !== 'PENDING_REVIEW') {
      throw new BadRequestException('Only reconciliations pending review can be rejected');
    }

    return await this.prisma.bankReconciliation.update({
      where: { id },
      data: {
        status: 'REJECTED',
        reviewedBy: userId,
        reviewedAt: new Date(),
        notes: `${reconciliation.notes || ''}\n\nREJECTED: ${reason}`,
      },
    });
  }

  /**
   * Void reconciliation
   */
  async void(id: string, reason: string): Promise<BankReconciliationEntity> {
    const reconciliation = await this.prisma.bankReconciliation.update({
      where: { id },
      data: {
        status: 'VOIDED',
        notes: reason,
      },
    });

    return reconciliation;
  }
}
