import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';
import { UseGuards } from '@nestjs/common';
import { JournalEntryService } from '../services/journal-entry.service';
import {
  CreateJournalEntryInput,
  ListJournalEntriesInput,
  VoidJournalEntryInput,
  ReverseJournalEntryInput,
} from '../dto/journal-entry.input';
import { DateRangeInput } from '../../common/dto/date-range.input';
import { JournalEntryEntity, JournalEntryListResponse } from '../entities/journal-entry.entity';
import { DashboardStatsEntity } from '../entities/dashboard-stats.entity';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * JournalEntryResolver
 * GraphQL resolver for journal entry operations
 */
@Resolver('JournalEntry')
export class JournalEntryResolver {
  constructor(
    private readonly journalEntryService: JournalEntryService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Get journal entry by ID
   */
  @Query(() => JournalEntryEntity)
  async journalEntry(@Args('id') id: string): Promise<JournalEntryEntity> {
    return this.journalEntryService.getJournalEntryById(id);
  }

  /**
   * List journal entries
   */
  @Query(() => JournalEntryListResponse)
  async journalEntries(
    @Args('input') input: ListJournalEntriesInput,
  ): Promise<JournalEntryListResponse> {
    const filters = {
      status: input.status,
      fiscalYear: input.fiscalYear,
      fiscalPeriod: input.fiscalPeriod,
      sourceModule: input.sourceModule,
      startDate: input.startDate ? new Date(input.startDate) : undefined,
      endDate: input.endDate ? new Date(input.endDate) : undefined,
    };

    const pagination = {
      skip: input.skip,
      take: input.take,
    };

    return this.journalEntryService.listJournalEntries(
      input.organisationId,
      input.branchId,
      filters,
      pagination,
    );
  }

  /**
   * Create journal entry
   */
  @Mutation(() => JournalEntryEntity)
  async createJournalEntry(
    @Args('input') input: CreateJournalEntryInput,
    @CurrentUser() user: any,
  ): Promise<JournalEntryEntity> {
    const entryDate = new Date(input.entryDate);
    const fiscalYear = entryDate.getFullYear();
    const fiscalPeriod = entryDate.getMonth() + 1;

    return this.journalEntryService.createJournalEntry(
      {
        entryDate,
        entryType: input.entryType,
        sourceModule: input.sourceModule,
        sourceTransactionId: input.sourceTransactionId,
        description: input.description,
        reference: input.reference,
        memo: input.memo,
        fiscalYear,
        fiscalPeriod,
        organisationId: input.organisationId,
        branchId: input.branchId,
      } as any,
      input.lines,
      user.id,
    );
  }

  /**
   * Post journal entry to GL
   */
  @Mutation(() => JournalEntryEntity)
  async postJournalEntry(
    @Args('id') id: string,
    @Args('version', { type: () => Int, nullable: true }) version: number,
    @CurrentUser() user: any,
  ): Promise<JournalEntryEntity> {
    return this.journalEntryService.postJournalEntry(id, user.id);
  }

  /**
   * Void journal entry
   */
  @Mutation(() => JournalEntryEntity)
  async voidJournalEntry(
    @Args('input') input: VoidJournalEntryInput,
    @Args('version', { type: () => Int, nullable: true }) version: number,
    @CurrentUser() user: any,
  ): Promise<JournalEntryEntity> {
    return this.journalEntryService.voidJournalEntry(
      input.id,
      input.reason,
      user.id,
    );
  }

  /**
   * Create reversing entry
   */
  @Mutation(() => JournalEntryEntity)
  async reverseJournalEntry(
    @Args('input') input: ReverseJournalEntryInput,
    @CurrentUser() user: any,
  ): Promise<JournalEntryEntity> {
    return this.journalEntryService.createReversingEntry(
      input.originalEntryId,
      input.reason,
      user.id,
    );
  }

  /**
   * Get transaction stats for dashboard
   */
  @Query(() => DashboardStatsEntity)
  async transactionStats(
    @Args('organisationId') organisationId: string,
    @Args('branchId', { nullable: true }) branchId?: string,
    @Args('dateRange', { nullable: true }) dateRange?: DateRangeInput,
  ): Promise<DashboardStatsEntity> {
    const where: any = {
      organisationId,
      status: 'POSTED',
    };

    if (branchId) {
      where.branchId = branchId;
    }

    if (dateRange?.startDate || dateRange?.endDate) {
      where.entryDate = {};
      if (dateRange.startDate) {
        where.entryDate.gte = new Date(dateRange.startDate);
      }
      if (dateRange.endDate) {
        where.entryDate.lte = new Date(dateRange.endDate);
      }
    }

    // Get all posted journal entries with their lines
    const entries = await this.prisma.journalEntry.findMany({
      where,
      include: {
        lines: {
          include: {
            account: true,
          },
        },
      },
    });

    // Calculate stats from journal entry lines - purely type-based
    let totalIncome = 0;
    let totalExpenses = 0;

    for (const entry of entries) {
      for (const line of entry.lines) {
        const account = line.account;
        
        // Revenue accounts - credits increase revenue
        if (account.accountType === 'REVENUE') {
          totalIncome += Number(line.creditAmount);
        }
        
        // Expense accounts - debits increase expenses
        if (account.accountType === 'EXPENSE') {
          totalExpenses += Number(line.debitAmount);
        }
      }
    }

    const netBalance = totalIncome - totalExpenses;

    // Get offering totals from offering batches (source of truth)
    const offeringBatches = await this.prisma.offeringBatch.findMany({
      where: {
        organisationId,
        ...(branchId && { branchId }),
        status: 'POSTED',
        isPostedToGL: true,
        ...(dateRange?.startDate || dateRange?.endDate ? {
          batchDate: {
            ...(dateRange.startDate && { gte: dateRange.startDate }),
            ...(dateRange.endDate && { lte: dateRange.endDate }),
          }
        } : {}),
      },
    });

    const totalOfferings = offeringBatches.reduce(
      (sum, batch) => sum + Number(batch.totalAmount),
      0
    );

    return {
      totalIncome,
      totalExpenses,
      netBalance,
      totalOfferings,
      totalTithes: 0, // Calculate from offering batches with type filter if needed
      totalPledges: 0, // Calculate from pledges module when implemented
    };
  }
}
