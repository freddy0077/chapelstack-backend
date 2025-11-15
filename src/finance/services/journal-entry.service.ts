import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JournalEntry, JournalEntryStatus, Prisma } from '@prisma/client';

/**
 * JournalEntryService
 * Manages journal entries and double-entry bookkeeping
 * Branch-level service
 */
@Injectable()
export class JournalEntryService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create journal entry
   * Validates double-entry (DR = CR)
   */
  async createJournalEntry(
    data: Prisma.JournalEntryCreateInput,
    lines: Array<{
      accountId: string;
      description?: string;
      debitAmount: number;
      creditAmount: number;
      fundId?: string;
      ministryId?: string;
      memberId?: string;
    }>,
    createdBy: string,
  ): Promise<JournalEntry> {
    // Extract organisationId and branchId from data
    const organisationId = (data as any).organisationId;
    const branchId = (data as any).branchId;
    const entryDate = new Date((data as any).entryDate);
    const fiscalYear = (data as any).fiscalYear;
    const fiscalPeriod = (data as any).fiscalPeriod;

    // ===== VALIDATION 1: Basic Input Validation =====
    if (!organisationId || !branchId) {
      throw new BadRequestException('Organization and branch are required');
    }

    if (!lines || lines.length === 0) {
      throw new BadRequestException('Journal entry must have at least one line');
    }

    if (lines.length > 100) {
      throw new BadRequestException('Journal entry cannot have more than 100 lines');
    }

    // ===== VALIDATION 2: Date Validation =====
    const now = new Date();
    if (entryDate > now) {
      throw new BadRequestException('Entry date cannot be in the future');
    }

    // Check if date is too old (more than 5 years)
    const fiveYearsAgo = new Date();
    fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
    if (entryDate < fiveYearsAgo) {
      throw new BadRequestException('Entry date cannot be more than 5 years in the past');
    }

    // ===== VALIDATION 3: Fiscal Period Validation =====
    if (!fiscalYear || !fiscalPeriod) {
      throw new BadRequestException('Fiscal year and period are required');
    }

    if (fiscalPeriod < 1 || fiscalPeriod > 12) {
      throw new BadRequestException('Fiscal period must be between 1 and 12');
    }

    // Check if fiscal period exists and is open
    const period = await this.prisma.fiscalPeriod.findFirst({
      where: {
        fiscalYear,
        periodNumber: fiscalPeriod,
        organisationId,
        branchId,
      },
    });

    if (period && (period.status === 'CLOSED' || period.status === 'LOCKED')) {
      throw new BadRequestException(
        `Cannot create journal entry in ${period.status.toLowerCase()} fiscal period`,
      );
    }

    // ===== VALIDATION 4: Line Item Validation =====
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNum = i + 1;

      // Validate account exists
      const account = await this.prisma.account.findUnique({
        where: { id: line.accountId },
      });

      if (!account) {
        throw new BadRequestException(`Line ${lineNum}: Account not found`);
      }

      // Validate account belongs to same organization
      if (account.organisationId !== organisationId) {
        throw new BadRequestException(
          `Line ${lineNum}: Account does not belong to this organization`,
        );
      }

      // Validate account is active
      if (!account.isActive) {
        throw new BadRequestException(
          `Line ${lineNum}: Account "${account.accountName}" is inactive`,
        );
      }

      // Validate amounts are valid numbers
      if (isNaN(line.debitAmount) || isNaN(line.creditAmount)) {
        throw new BadRequestException(`Line ${lineNum}: Invalid amount`);
      }

      // Validate amounts are not negative
      if (line.debitAmount < 0 || line.creditAmount < 0) {
        throw new BadRequestException(`Line ${lineNum}: Amounts cannot be negative`);
      }

      // Validate amounts are within reasonable limits (max 1 billion)
      const MAX_AMOUNT = 999999999.99;
      if (line.debitAmount > MAX_AMOUNT || line.creditAmount > MAX_AMOUNT) {
        throw new BadRequestException(
          `Line ${lineNum}: Amount exceeds maximum allowed (${MAX_AMOUNT})`,
        );
      }

      // Validate precision (max 2 decimal places)
      const debitDecimals = (line.debitAmount.toString().split('.')[1] || '').length;
      const creditDecimals = (line.creditAmount.toString().split('.')[1] || '').length;
      if (debitDecimals > 2 || creditDecimals > 2) {
        throw new BadRequestException(
          `Line ${lineNum}: Amounts cannot have more than 2 decimal places`,
        );
      }

      // Validate each line has either debit or credit (not both)
      if (line.debitAmount > 0 && line.creditAmount > 0) {
        throw new BadRequestException(
          `Line ${lineNum}: Cannot have both debit and credit amounts`,
        );
      }

      // Validate each line has at least one amount
      if (line.debitAmount === 0 && line.creditAmount === 0) {
        throw new BadRequestException(
          `Line ${lineNum}: Must have either debit or credit amount`,
        );
      }

      // Validate description length
      if (line.description && line.description.length > 500) {
        throw new BadRequestException(
          `Line ${lineNum}: Description cannot exceed 500 characters`,
        );
      }
    }

    // ===== VALIDATION 5: Double-Entry Balance =====
    const totalDebits = lines.reduce((sum, line) => sum + Number(line.debitAmount), 0);
    const totalCredits = lines.reduce((sum, line) => sum + Number(line.creditAmount), 0);

    if (Math.abs(totalDebits - totalCredits) > 0.01) {
      throw new BadRequestException(
        `Journal entry not balanced. Total Debits: ${totalDebits.toFixed(2)}, Total Credits: ${totalCredits.toFixed(2)}, Difference: ${Math.abs(totalDebits - totalCredits).toFixed(2)}`,
      );
    }

    // Validate total is not zero
    if (totalDebits === 0) {
      throw new BadRequestException('Journal entry total cannot be zero');
    }

    // ===== ALL VALIDATIONS PASSED - CREATE ENTRY =====
    // Create journal entry with retry on unique constraint violation
    for (let attempt = 0; attempt < 5; attempt++) {
      // Generate journal entry number
      const journalEntryNumber = await this.generateJournalEntryNumber(
        organisationId,
        branchId,
      );

      try {
        // Create journal entry with lines
        return await this.prisma.journalEntry.create({
          data: {
            ...data,
            journalEntryNumber,
            createdBy,
            lines: {
              create: lines.map((line, index) => ({
                lineNumber: index + 1,
                accountId: line.accountId,
                description: line.description,
                debitAmount: line.debitAmount,
                creditAmount: line.creditAmount,
                fundId: line.fundId,
                ministryId: line.ministryId,
                memberId: line.memberId,
              })),
            },
          },
          include: {
            lines: {
              include: {
                account: true,
                fund: true,
                ministry: true,
                member: true,
              },
            },
          },
        });
      } catch (e: any) {
        // P2002 = unique constraint violation
        if (e.code === 'P2002' && attempt < 4) {
          // Small jitter to reduce contention on retry
          await new Promise(r => setTimeout(r, 10 + Math.random() * 40));
          continue;
        }
        throw e;
      }
    }

    throw new Error('Failed to allocate unique journal entry number after retries');
  }

  /**
   * Get journal entry by ID
   */
  async getJournalEntryById(id: string): Promise<any> {
    const entry = await this.prisma.journalEntry.findUnique({
      where: { id },
      include: {
        lines: {
          include: {
            account: true,
            fund: true,
            ministry: true,
            member: true,
          },
          orderBy: {
            lineNumber: 'asc',
          },
        },
        branch: true,
        organisation: true,
      },
    });

    if (!entry) {
      throw new NotFoundException(`Journal entry with ID ${id} not found`);
    }

    return entry;
  }

  /**
   * List journal entries with filters
   */
  async listJournalEntries(
    organisationId: string,
    branchId: string,
    filters?: {
      status?: JournalEntryStatus;
      fiscalYear?: number;
      fiscalPeriod?: number;
      sourceModule?: string;
      startDate?: Date;
      endDate?: Date;
    },
    pagination?: {
      skip?: number;
      take?: number;
    },
  ): Promise<{ items: JournalEntry[]; totalCount: number }> {
    const where: Prisma.JournalEntryWhereInput = {
      organisationId,
      branchId,
    };

    if (filters) {
      if (filters.status) where.status = filters.status;
      if (filters.fiscalYear) where.fiscalYear = filters.fiscalYear;
      if (filters.fiscalPeriod) where.fiscalPeriod = filters.fiscalPeriod;
      if (filters.sourceModule) where.sourceModule = filters.sourceModule;
      if (filters.startDate || filters.endDate) {
        where.entryDate = {};
        if (filters.startDate) where.entryDate.gte = filters.startDate;
        if (filters.endDate) where.entryDate.lte = filters.endDate;
      }
    }

    const [items, totalCount] = await Promise.all([
      this.prisma.journalEntry.findMany({
        where,
        include: {
          lines: {
            include: {
              account: true,
            },
          },
        },
        orderBy: {
          entryDate: 'desc',
        },
        skip: pagination?.skip,
        take: pagination?.take,
      }),
      this.prisma.journalEntry.count({ where }),
    ]);

    return { items, totalCount };
  }

  /**
   * Post journal entry to GL
   * Changes status from DRAFT to POSTED
   */
  async postJournalEntry(id: string, postedBy: string): Promise<JournalEntry> {
    const entry = await this.getJournalEntryById(id);

    if (entry.status === 'POSTED') {
      throw new BadRequestException('Journal entry already posted');
    }

    if (entry.status === 'VOID') {
      throw new BadRequestException('Cannot post voided journal entry');
    }

    // Check if fiscal period exists, create if not
    let period = await this.prisma.fiscalPeriod.findFirst({
      where: {
        fiscalYear: entry.fiscalYear,
        periodNumber: entry.fiscalPeriod,
        organisationId: entry.organisationId,
        branchId: entry.branchId,
      },
    });

    // Auto-create fiscal period if it doesn't exist
    if (!period) {
      const entryDate = new Date(entry.entryDate);
      const year = entryDate.getFullYear();
      const month = entryDate.getMonth(); // 0-indexed
      
      // Calculate period dates
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0); // Last day of month
      
      // Month names
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      
      period = await this.prisma.fiscalPeriod.create({
        data: {
          fiscalYear: entry.fiscalYear,
          periodNumber: entry.fiscalPeriod,
          periodName: monthNames[month],
          startDate,
          endDate,
          status: 'OPEN',
          organisationId: entry.organisationId,
          branchId: entry.branchId,
        },
      });
    }

    if (period.status !== 'OPEN') {
      throw new BadRequestException(
        `Cannot post to ${period.status.toLowerCase()} fiscal period`,
      );
    }

    // Update journal entry status
    const updatedEntry = await this.prisma.journalEntry.update({
      where: { id },
      data: {
        status: 'POSTED',
        postingDate: new Date(),
        postedBy,
      },
      include: {
        lines: {
          include: {
            account: true,
          },
        },
      },
    });

    // Note: Account balances are calculated dynamically from journal entry lines
    // No need to store balances as they are derived from posted transactions
    // This ensures data integrity and follows proper accounting principles

    return updatedEntry;
  }

  /**
   * Void journal entry
   */
  async voidJournalEntry(
    id: string,
    reason: string,
    voidedBy: string,
  ): Promise<JournalEntry> {
    const entry = await this.getJournalEntryById(id);

    if (entry.status === 'VOID') {
      throw new BadRequestException('Journal entry already voided');
    }

    return this.prisma.journalEntry.update({
      where: { id },
      data: {
        status: 'VOID',
        reversalReason: reason,
        updatedBy: voidedBy,
      },
      include: {
        lines: {
          include: {
            account: true,
          },
        },
      },
    });
  }

  /**
   * Create reversing entry
   * Creates a new entry with opposite DR/CR
   */
  async createReversingEntry(
    originalEntryId: string,
    reason: string,
    createdBy: string,
  ): Promise<any> {
    const originalEntry: any = await this.getJournalEntryById(originalEntryId);

    if (originalEntry.status !== 'POSTED') {
      throw new BadRequestException('Can only reverse posted entries');
    }

    if (originalEntry.isReversed) {
      throw new BadRequestException('Entry already reversed');
    }

    // Create reversing lines (swap debit and credit)
    const reversingLines = originalEntry.lines.map((line) => ({
      accountId: line.accountId,
      description: `Reversal: ${line.description || ''}`,
      debitAmount: Number(line.creditAmount), // Swap
      creditAmount: Number(line.debitAmount), // Swap
      fundId: line.fundId,
      ministryId: line.ministryId,
      memberId: line.memberId,
    }));

    // Create reversing entry
    const reversingEntry = await this.createJournalEntry(
      {
        entryDate: new Date(),
        entryType: 'REVERSING',
        sourceModule: originalEntry.sourceModule,
        sourceTransactionId: originalEntry.sourceTransactionId,
        description: `Reversal of ${originalEntry.journalEntryNumber}: ${reason}`,
        reference: originalEntry.journalEntryNumber,
        fiscalYear: new Date().getFullYear(),
        fiscalPeriod: new Date().getMonth() + 1,
        organisationId: originalEntry.organisationId,
        branchId: originalEntry.branchId,
        reversedById: originalEntry.id,
      } as any,
      reversingLines,
      createdBy,
    );

    // Mark original as reversed
    await this.prisma.journalEntry.update({
      where: { id: originalEntryId },
      data: {
        isReversed: true,
        reversalReason: reason,
      },
    });

    // Auto-post the reversing entry
    await this.postJournalEntry(reversingEntry.id, createdBy);

    return reversingEntry;
  }

  /**
   * Generate journal entry number
   * Format: JE-YYYY-NNNN-SSSS
   * Includes timestamp-based suffix for uniqueness under concurrency
   */
  private async generateJournalEntryNumber(
    organisationId: string,
    branchId: string,
  ): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `JE-${year}-`;

    const lastEntry = await this.prisma.journalEntry.findFirst({
      where: {
        organisationId,
        branchId,
        journalEntryNumber: {
          startsWith: prefix,
        },
      },
      orderBy: {
        journalEntryNumber: 'desc',
      },
    });

    let nextNumber = 1;
    if (lastEntry) {
      // Extract just the numeric part (before the timestamp suffix)
      const parts = lastEntry.journalEntryNumber.replace(prefix, '').split('-');
      const lastNumber = parseInt(parts[0], 10);
      // Guard against NaN
      if (!Number.isFinite(lastNumber)) {
        nextNumber = 1;
      } else {
        nextNumber = lastNumber + 1;
      }
    }

    // Add timestamp-based suffix to reduce collisions under concurrency
    const now = Date.now();
    const microSuffix = (now % 10000).toString().padStart(4, '0');

    return `${prefix}${nextNumber.toString().padStart(4, '0')}-${microSuffix}`;
  }
}
