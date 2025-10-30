import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OfferingBatch, OfferingBatchStatus, Prisma } from '@prisma/client';
import { JournalEntryService } from './journal-entry.service';

/**
 * OfferingService
 * Manages offering batches and collection
 * Branch-level service
 */
@Injectable()
export class OfferingService {
  constructor(
    private prisma: PrismaService,
    private journalEntryService: JournalEntryService,
  ) {}

  /**
   * Create offering batch
   */
  async createOfferingBatch(
    data: {
      batchDate: Date;
      serviceName: string;
      serviceId?: string;
      offeringType?: string;
      cashAmount: number;
      mobileMoneyAmount?: number;
      chequeAmount?: number;
      foreignCurrencyAmount?: number;
      cashDenominations?: any;
      counters?: string[];
      countedBy: string[];
      verifierId?: string;
      status?: string;
    },
    organisationId: string,
    branchId: string,
    createdBy?: string,
  ): Promise<OfferingBatch> {
    // ===== VALIDATION 1: Basic Input Validation =====
    if (!organisationId || !branchId) {
      throw new BadRequestException('Organization and branch are required');
    }

    if (!data.serviceName || data.serviceName.trim().length === 0) {
      throw new BadRequestException('Service name is required');
    }

    if (data.serviceName.length > 200) {
      throw new BadRequestException('Service name cannot exceed 200 characters');
    }

    if (!data.countedBy || data.countedBy.length === 0) {
      throw new BadRequestException('At least one counter is required');
    }

    if (data.countedBy.length > 10) {
      throw new BadRequestException('Cannot have more than 10 counters');
    }

    // ===== VALIDATION 2: Date Validation =====
    const batchDate = new Date(data.batchDate);
    const now = new Date();
    
    if (batchDate > now) {
      throw new BadRequestException('Batch date cannot be in the future');
    }

    // Check if date is too old (more than 1 year)
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    if (batchDate < oneYearAgo) {
      throw new BadRequestException('Batch date cannot be more than 1 year in the past');
    }

    // ===== VALIDATION 3: Amount Validation =====
    const cashAmount = Number(data.cashAmount) || 0;
    const mobileMoneyAmount = Number(data.mobileMoneyAmount) || 0;
    const chequeAmount = Number(data.chequeAmount) || 0;
    const foreignCurrencyAmount = Number(data.foreignCurrencyAmount) || 0;

    // Validate amounts are not negative
    if (cashAmount < 0) {
      throw new BadRequestException('Cash amount cannot be negative');
    }
    if (mobileMoneyAmount < 0) {
      throw new BadRequestException('Mobile money amount cannot be negative');
    }
    if (chequeAmount < 0) {
      throw new BadRequestException('Cheque amount cannot be negative');
    }
    if (foreignCurrencyAmount < 0) {
      throw new BadRequestException('Foreign currency amount cannot be negative');
    }

    // Validate amounts are within reasonable limits (max 10 million)
    const MAX_AMOUNT = 10000000.00;
    if (cashAmount > MAX_AMOUNT) {
      throw new BadRequestException(`Cash amount exceeds maximum allowed (${MAX_AMOUNT})`);
    }
    if (mobileMoneyAmount > MAX_AMOUNT) {
      throw new BadRequestException(`Mobile money amount exceeds maximum allowed (${MAX_AMOUNT})`);
    }
    if (chequeAmount > MAX_AMOUNT) {
      throw new BadRequestException(`Cheque amount exceeds maximum allowed (${MAX_AMOUNT})`);
    }

    // Validate precision (max 2 decimal places)
    const validateDecimals = (amount: number, name: string) => {
      const decimals = (amount.toString().split('.')[1] || '').length;
      if (decimals > 2) {
        throw new BadRequestException(`${name} cannot have more than 2 decimal places`);
      }
    };

    validateDecimals(cashAmount, 'Cash amount');
    validateDecimals(mobileMoneyAmount, 'Mobile money amount');
    validateDecimals(chequeAmount, 'Cheque amount');
    validateDecimals(foreignCurrencyAmount, 'Foreign currency amount');

    // Calculate total
    const totalAmount = cashAmount + mobileMoneyAmount + chequeAmount + foreignCurrencyAmount;

    // Validate total is not zero
    if (totalAmount === 0) {
      throw new BadRequestException('Offering total cannot be zero');
    }

    // Validate total is within reasonable limits
    if (totalAmount > MAX_AMOUNT) {
      throw new BadRequestException(`Total offering amount exceeds maximum allowed (${MAX_AMOUNT})`);
    }

    // Generate batch number
    const batchNumber = await this.generateBatchNumber(
      organisationId,
      branchId,
    );

    return this.prisma.offeringBatch.create({
      data: {
        batchNumber,
        batchDate: data.batchDate,
        serviceName: data.serviceName,
        serviceId: data.serviceId,
        offeringType: data.offeringType as any || 'GENERAL',
        cashAmount: data.cashAmount,
        mobileMoneyAmount: data.mobileMoneyAmount || 0,
        chequeAmount: data.chequeAmount || 0,
        foreignCurrencyAmount: data.foreignCurrencyAmount || 0,
        totalAmount,
        cashDenominations: data.cashDenominations,
        counters: data.counters,
        countedBy: data.countedBy,
        verifierId: data.verifierId,
        status: (data.status as any) || 'COUNTING',
        organisationId,
        branchId,
        createdBy,
      },
      include: {
        contributions: true,
      },
    });
  }

  /**
   * Get offering batch by ID
   */
  async getOfferingBatchById(id: string): Promise<any> {
    const batch = await this.prisma.offeringBatch.findUnique({
      where: { id },
      include: {
        contributions: {
          include: {
            contributionType: true,
            fund: true,
            member: true,
          },
        },
        journalEntry: {
          include: {
            lines: {
              include: {
                account: true,
              },
            },
          },
        },
        branch: true,
        organisation: true,
      },
    });

    if (!batch) {
      throw new NotFoundException(`Offering batch with ID ${id} not found`);
    }

    return batch;
  }

  /**
   * List offering batches
   */
  async listOfferingBatches(
    organisationId: string,
    branchId: string,
    filters?: {
      status?: OfferingBatchStatus;
      startDate?: Date;
      endDate?: Date;
    },
    pagination?: {
      skip?: number;
      take?: number;
    },
  ): Promise<{ items: OfferingBatch[]; totalCount: number }> {
    const where: Prisma.OfferingBatchWhereInput = {
      organisationId,
      branchId,
    };

    if (filters) {
      if (filters.status) where.status = filters.status;
      if (filters.startDate || filters.endDate) {
        where.batchDate = {};
        if (filters.startDate) where.batchDate.gte = filters.startDate;
        if (filters.endDate) where.batchDate.lte = filters.endDate;
      }
    }

    const [items, totalCount] = await Promise.all([
      this.prisma.offeringBatch.findMany({
        where,
        include: {
          contributions: true,
        },
        orderBy: {
          batchDate: 'desc',
        },
        skip: pagination?.skip,
        take: pagination?.take,
      }),
      this.prisma.offeringBatch.count({ where }),
    ]);

    return { items, totalCount };
  }

  /**
   * Verify offering batch
   * Second counter verification with optional deposit recording
   */
  async verifyOfferingBatch(
    id: string,
    verifiedBy?: string,
    discrepancyAmount?: number,
    discrepancyNotes?: string,
    depositInfo?: {
      bankAccountId?: string;
      depositDate?: Date;
      depositSlipNumber?: string;
    },
  ): Promise<OfferingBatch> {
    // ===== VALIDATION 1: Basic Input Validation =====
    if (!id) {
      throw new BadRequestException('Offering batch ID is required');
    }

    const batch = await this.getOfferingBatchById(id);

    // ===== VALIDATION 2: Status Validation =====
    if (batch.status !== 'COUNTING') {
      throw new BadRequestException(
        `Can only verify batches in COUNTING status. Current status: ${batch.status}`,
      );
    }

    // ===== VALIDATION 3: Discrepancy Validation =====
    if (discrepancyAmount !== undefined) {
      if (isNaN(discrepancyAmount)) {
        throw new BadRequestException('Discrepancy amount must be a valid number');
      }

      // Discrepancy can be negative (shortage) or positive (overage)
      const MAX_DISCREPANCY = 10000.00;
      if (Math.abs(discrepancyAmount) > MAX_DISCREPANCY) {
        throw new BadRequestException(
          `Discrepancy amount exceeds maximum allowed (${MAX_DISCREPANCY})`
        );
      }

      // Validate precision
      const decimals = (discrepancyAmount.toString().split('.')[1] || '').length;
      if (decimals > 2) {
        throw new BadRequestException(
          'Discrepancy amount cannot have more than 2 decimal places'
        );
      }

      // If there's a discrepancy, notes should be provided
      if (Math.abs(discrepancyAmount) > 0.01 && !discrepancyNotes) {
        throw new BadRequestException(
          'Discrepancy notes are required when there is a discrepancy'
        );
      }
    }

    // ===== VALIDATION 4: Discrepancy Notes Validation =====
    if (discrepancyNotes && discrepancyNotes.length > 1000) {
      throw new BadRequestException('Discrepancy notes cannot exceed 1000 characters');
    }

    // ===== VALIDATION 5: Deposit Info Validation =====
    if (depositInfo?.bankAccountId) {
      // Validate bank account exists
      const bankAccount = await this.prisma.bankAccount.findUnique({
        where: { id: depositInfo.bankAccountId },
      });

      if (!bankAccount) {
        throw new NotFoundException(
          `Bank account with ID ${depositInfo.bankAccountId} not found`
        );
      }

      // Validate bank account belongs to same organization
      if (bankAccount.organisationId !== batch.organisationId) {
        throw new BadRequestException(
          'Bank account must belong to the same organization'
        );
      }

      // Validate bank account is active
      if (bankAccount.status === 'INACTIVE') {
        throw new BadRequestException('Cannot deposit to inactive bank account');
      }

      // Validate deposit date
      if (depositInfo.depositDate) {
        const depositDate = new Date(depositInfo.depositDate);
        depositDate.setHours(0, 0, 0, 0);
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Allow today and past dates, but not future dates
        if (depositDate > today) {
          throw new BadRequestException('Deposit date cannot be in the future');
        }

        // Deposit date should not be before batch date
        const batchDate = new Date(batch.batchDate);
        batchDate.setHours(0, 0, 0, 0);
        
        if (depositDate < batchDate) {
          const batchDateStr = batchDate.toISOString().split('T')[0];
          throw new BadRequestException(
            `Deposit date cannot be before batch date (${batchDateStr})`
          );
        }

        // Deposit date should not be more than 30 days after batch date
        const thirtyDaysAfterBatch = new Date(batch.batchDate);
        thirtyDaysAfterBatch.setDate(thirtyDaysAfterBatch.getDate() + 30);
        if (depositDate > thirtyDaysAfterBatch) {
          throw new BadRequestException(
            'Deposit date cannot be more than 30 days after batch date'
          );
        }
      }

      // Validate deposit slip number
      if (depositInfo.depositSlipNumber) {
        if (depositInfo.depositSlipNumber.length > 50) {
          throw new BadRequestException(
            'Deposit slip number cannot exceed 50 characters'
          );
        }

        // Check for duplicate deposit slip number
        const existingDeposit = await this.prisma.offeringBatch.findFirst({
          where: {
            depositSlipNumber: depositInfo.depositSlipNumber,
            organisationId: batch.organisationId,
            id: { not: id },
          },
        });

        if (existingDeposit) {
          throw new BadRequestException(
            `Deposit slip number ${depositInfo.depositSlipNumber} already used`
          );
        }
      }
    }

    // ===== VALIDATION 6: Segregation of Duties =====
    // Verifier should not be the same as creator
    if (verifiedBy && batch.createdBy === verifiedBy) {
      throw new BadRequestException(
        'You cannot verify a batch you created. Please have another user verify it.'
      );
    }

    // Determine status based on whether deposit info is provided
    const newStatus = depositInfo?.bankAccountId ? 'DEPOSITED' : 'VERIFIED';

    // Update offering batch
    const updatedBatch = await this.prisma.offeringBatch.update({
      where: { id },
      data: {
        status: newStatus,
        verifiedBy,
        verifiedAt: new Date(),
        discrepancyAmount,
        discrepancyNotes,
        // Deposit information (if provided)
        ...(depositInfo?.depositDate && { depositDate: depositInfo.depositDate }),
        ...(depositInfo?.depositSlipNumber && { depositSlipNumber: depositInfo.depositSlipNumber }),
      },
      include: {
        contributions: true,
      },
    });

    // If deposit info provided, update bank account balance
    if (depositInfo?.bankAccountId) {
      const depositAmount = Number(batch.totalAmount);
      
      await this.prisma.bankAccount.update({
        where: { id: depositInfo.bankAccountId },
        data: {
          bankBalance: {
            increment: depositAmount,
          },
        },
      });
    }

    return updatedBatch;
  }

  /**
   * Approve offering batch
   * Final approval before posting to GL
   */
  async approveOfferingBatch(
    id: string,
    approvedBy?: string,
  ): Promise<OfferingBatch> {
    const batch = await this.getOfferingBatchById(id);

    if (batch.status !== 'VERIFIED' && batch.status !== 'DEPOSITED') {
      throw new BadRequestException(
        'Can only approve batches in VERIFIED or DEPOSITED status',
      );
    }

    return this.prisma.offeringBatch.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedBy,
        approvedAt: new Date(),
      },
      include: {
        contributions: true,
      },
    });
  }

  /**
   * Post offering batch to GL
   * Creates journal entry automatically
   */
  async postOfferingToGL(
    id: string,
    postedBy: string,
    accountMapping?: {
      cashAccountId?: string;
      mobileMoneyAccountId?: string;
      chequeAccountId?: string;
      revenueAccountId?: string;
      notes?: string;
    },
  ): Promise<any> {
    const batch: any = await this.getOfferingBatchById(id);

    if (batch.status !== 'APPROVED') {
      throw new BadRequestException(
        'Can only post batches in APPROVED status',
      );
    }

    if (batch.isPostedToGL) {
      throw new BadRequestException('Batch already posted to GL');
    }

    // Get offering types with revenue accounts
    const offeringTypes = await this.prisma.offeringType.findMany({
      where: {
        organisationId: batch.organisationId,
        branchId: batch.branchId,
        isActive: true,
      },
      include: {
        revenueAccount: true,
      },
    });

    // Group contributions by offering type
    const contributionsByType = new Map<string, number>();
    for (const contribution of batch.contributions) {
      const current = contributionsByType.get(contribution.contributionTypeId) || 0;
      contributionsByType.set(
        contribution.contributionTypeId,
        current + contribution.amount,
      );
    }

    // Build journal entry lines
    const lines: Array<{
      accountId: string;
      description: string;
      debitAmount: number;
      creditAmount: number;
    }> = [];

    // DR: Cash account
    const cashAmount = Number(batch.cashAmount);
    if (cashAmount > 0) {
      if (!accountMapping?.cashAccountId) {
        throw new BadRequestException(
          'Cash account must be provided when posting offerings with cash amounts'
        );
      }

      lines.push({
        accountId: accountMapping.cashAccountId,
        description: `Cash offering - ${batch.serviceName}`,
        debitAmount: cashAmount,
        creditAmount: 0,
      });
    }

    // DR: Mobile Money account
    const mobileMoneyAmount = Number(batch.mobileMoneyAmount);
    if (mobileMoneyAmount > 0) {
      if (!accountMapping?.mobileMoneyAccountId) {
        throw new BadRequestException(
          'Mobile Money account must be provided when posting offerings with mobile money amounts'
        );
      }

      lines.push({
        accountId: accountMapping.mobileMoneyAccountId,
        description: `Mobile Money offering - ${batch.serviceName}`,
        debitAmount: mobileMoneyAmount,
        creditAmount: 0,
      });
    }

    // CR: Revenue accounts
    // Use provided revenue account or fall back to offering type mapping
    if (accountMapping?.revenueAccountId) {
      // Use the revenue account provided from frontend
      lines.push({
        accountId: accountMapping.revenueAccountId,
        description: `Offering - ${batch.serviceName}`,
        debitAmount: 0,
        creditAmount: Number(batch.totalAmount),
      });
    } else {
      // Fall back to offering type mapping
      for (const [typeId, amount] of contributionsByType.entries()) {
        const offeringType = offeringTypes.find((t) => t.id === typeId);
        
        if (offeringType && offeringType.revenueAccount) {
          lines.push({
            accountId: offeringType.revenueAccount.id,
            description: `${offeringType.name} - ${batch.serviceName}`,
            debitAmount: 0,
            creditAmount: amount,
          });
        }
      }
    }

    // Validate that we have revenue account(s)
    const totalCredit = lines.reduce((sum, line) => sum + line.creditAmount, 0);
    if (totalCredit === 0) {
      throw new BadRequestException('No revenue account found or provided');
    }

    // Build description with notes if provided
    const description = accountMapping?.notes 
      ? `Offering Batch - ${batch.serviceName} - ${accountMapping.notes}`
      : `Offering Batch - ${batch.serviceName}`;

    // ===== USE DATABASE TRANSACTION FOR ATOMICITY =====
    // All operations must succeed or all fail
    return await this.prisma.$transaction(async (tx) => {
      // Create journal entry
      const journalEntry = await this.journalEntryService.createJournalEntry(
        {
          entryDate: batch.batchDate,
          entryType: 'STANDARD',
          sourceModule: 'OFFERING',
          sourceTransactionId: batch.id,
          description,
          reference: batch.batchNumber,
          fiscalYear: batch.batchDate.getFullYear(),
          fiscalPeriod: batch.batchDate.getMonth() + 1,
          organisationId: batch.organisationId,
          branchId: batch.branchId,
        } as any,
        lines,
        postedBy,
      );

      // Post journal entry
      await this.journalEntryService.postJournalEntry(journalEntry.id, postedBy);

      // Update offering batch
      const updatedBatch = await tx.offeringBatch.update({
        where: { id },
        data: {
          status: 'POSTED',
          isPostedToGL: true,
          journalEntryId: journalEntry.id,
        },
        include: {
          contributions: true,
          journalEntry: {
            include: {
              lines: {
                include: {
                  account: true,
                },
              },
            },
          },
        },
      });

      return updatedBatch;
    });
  }

  /**
   * Generate batch number
   * Format: OFR-YYYY-NNNN
   */
  private async generateBatchNumber(
    organisationId: string,
    branchId: string,
  ): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `OFR-${year}-`;

    const lastBatch = await this.prisma.offeringBatch.findFirst({
      where: {
        organisationId,
        branchId,
        batchNumber: {
          startsWith: prefix,
        },
      },
      orderBy: {
        batchNumber: 'desc',
      },
    });

    let nextNumber = 1;
    if (lastBatch) {
      const lastNumber = parseInt(
        lastBatch.batchNumber.replace(prefix, ''),
      );
      nextNumber = lastNumber + 1;
    }

    return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
  }
}
