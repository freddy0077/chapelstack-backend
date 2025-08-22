import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionInput } from './dto/create-transaction.input';
import { UpdateTransactionInput } from './dto/update-transaction.input';
import { TransactionType, Prisma } from '@prisma/client';
import { TransactionStats } from './dto/transaction-stats.dto';
import { DateRangeInput } from '../common/dto/date-range.input';
import {
  CashFlowAnalysisInput,
  ComparativePeriodAnalysisInput,
  MemberGivingAnalysisInput,
} from './dto/analytics-inputs.dto';
import {
  CashFlowAnalysis,
  CashFlowData,
  PeriodType,
} from './dto/cash-flow-analysis.dto';
import {
  ComparativePeriodAnalysis,
  ComparativePeriodData,
  ComparisonType,
} from './dto/comparative-period-analysis.dto';
import {
  MemberGivingAnalysis,
  GivingTrend,
  MonthlyGiving,
  FundGiving,
  ContributionDetail,
  TrendDirection,
} from './dto/member-giving-analysis.dto';
import {
  FinancialStatementsInput,
  FinancialStatements,
  IncomeStatement,
  BalanceSheet,
  CashFlowStatement,
  StatementOfNetAssets,
  FinancialLineItem,
  StatementType,
} from './dto/financial-statements.dto';
import {
  BudgetVsActualInput,
  BudgetVsActual,
  BudgetPeriodType,
  BudgetLineItem,
  BudgetSummary,
} from './dto/budget-vs-actual.dto';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { Parser as Json2CsvParser } from 'json2csv';
import * as ExcelJS from 'exceljs';
import { ConfigService } from '@nestjs/config';
import { WorkflowsService } from '../workflows/services/workflows.service';

@Injectable()
export class TransactionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly workflowsService: WorkflowsService,
  ) {}

  async create(data: CreateTransactionInput) {
    console.log('gddgedggded', data);
    // Defensive: ensure type is a valid TransactionType enum value
    if (!data.type || !Object.values(TransactionType).includes(data.type)) {
      throw new Error(`Invalid or missing transaction type: ${data.type}`);
    }

    const {
      organisationId,
      branchId,
      fundId,
      userId,
      memberId,
      eventId,
      amount,
      type,
      date,
      description,
      reference,
      metadata,
    } = data;

    const transaction = await this.prisma.transaction.create({
      data: {
        type,
        amount: new Prisma.Decimal(amount),
        date: date ? new Date(date) : undefined,
        description,
        reference,
        metadata,
        organisation: {
          connect: { id: organisationId },
        },
        ...(branchId && { branch: { connect: { id: branchId } } }),
        ...(fundId && { fund: { connect: { id: fundId } } }),
        ...(userId && { user: { connect: { id: userId } } }),
        ...(memberId && { member: { connect: { id: memberId } } }),
        ...(eventId && { event: { connect: { id: eventId } } }),
      },
    });

    // Trigger workflow automation for CONTRIBUTION transactions
    if (type === TransactionType.CONTRIBUTION) {
      try {
        await this.workflowsService.handleDonationReceived(
          transaction.id,
          organisationId,
          branchId,
        );
      } catch (error) {
        console.warn(
          `Failed to trigger donation received workflow for transaction ${transaction.id}: ${error.message}`,
        );
      }
    }

    return transaction;
  }

  async findAll(params: {
    organisationId?: string;
    branchId?: string;
    userId?: string;
    type?: TransactionType;
    fundId?: string;
    eventId?: string;
    skip?: number;
    take?: number;
    dateRange?: DateRangeInput;
    contributionTypeId?: string;
  }) {
    const {
      organisationId,
      branchId,
      userId,
      type,
      fundId,
      eventId,
      skip = 0,
      take = 10,
      dateRange,
      contributionTypeId,
    } = params;

    // Build the where clause
    const where: Prisma.TransactionWhereInput = {
      ...(organisationId && { organisationId }),
      ...(branchId && { branchId }),
      ...(userId && { userId }),
      ...(type && { type }),
      ...(fundId && { fundId }),
      ...(eventId && { eventId }),
    };

    // Add date range filtering if provided
    if (dateRange?.startDate || dateRange?.endDate) {
      where.date = {};

      if (dateRange.startDate) {
        where.date.gte = dateRange.startDate;
      }

      if (dateRange.endDate) {
        where.date.lte = dateRange.endDate;
      }
    }

    // Get transactions with pagination
    const [transactions, total] = await this.prisma.$transaction([
      this.prisma.transaction.findMany({
        where,
        skip,
        take,
        orderBy: { date: 'desc' },
      }),
      this.prisma.transaction.count({ where }),
    ]);

    // Calculate statistics for the same filters
    const stats = await this.calculateTransactionStats({
      organisationId:
        organisationId ||
        (() => {
          throw new Error(
            'organisationId is required for calculateTransactionStats',
          );
        })(),
      ...(branchId && { branchId }),
      dateRange,
      fundId,
      contributionTypeId,
      eventId,
    });

    return {
      items: transactions,
      totalCount: total,
      hasNextPage: skip + take < total,
      stats,
    };
  }

  async calculateTransactionStats(params: {
    organisationId: string;
    branchId?: string;
    dateRange?: DateRangeInput;
    fundId?: string;
    contributionTypeId?: string;
    eventId?: string;
  }): Promise<TransactionStats> {
    const {
      organisationId,
      branchId,
      dateRange,
      fundId,
      contributionTypeId,
      eventId,
    } = params;
    if (!organisationId) {
      throw new Error(
        'organisationId is required for calculateTransactionStats',
      );
    }
    const where: any = { organisationId };
    if (branchId) where.branchId = branchId;
    if (fundId) where.fundId = fundId;
    if (eventId) where.eventId = eventId;

    // Find contribution type IDs
    let titheTypeId = contributionTypeId;
    let pledgeTypeId: string | undefined;
    let offeringTypeId: string | undefined;
    if (!titheTypeId || !pledgeTypeId || !offeringTypeId) {
      const types = await this.prisma.contributionType.findMany({
        where: {
          name: { in: ['TITHE', 'PLEDGE', 'OFFERING'], mode: 'insensitive' },
        },
        select: { id: true, name: true },
      });
      titheTypeId =
        titheTypeId || types.find((t) => t.name.toUpperCase() === 'TITHE')?.id;
      pledgeTypeId = types.find((t) => t.name.toUpperCase() === 'PLEDGE')?.id;
      offeringTypeId = types.find(
        (t) => t.name.toUpperCase() === 'OFFERING',
      )?.id;
    }

    // Add date range filtering if provided
    if (dateRange?.startDate || dateRange?.endDate) {
      where.date = {};

      if (dateRange.startDate) {
        where.date.gte = dateRange.startDate;
      }

      if (dateRange.endDate) {
        where.date.lte = dateRange.endDate;
      }
    }

    // Total income (all income transactions)
    const incomeWhere = {
      ...where,
      type: TransactionType.CONTRIBUTION,
    };
    const totalIncome = await this.prisma.transaction.aggregate({
      where: incomeWhere,
      _sum: { amount: true },
    });

    // Total expenses
    const expenseWhere = {
      ...where,
      type: TransactionType.EXPENSE,
    };
    const totalExpenses = await this.prisma.transaction.aggregate({
      where: expenseWhere,
      _sum: { amount: true },
    });

    // Total tithes
    const tithesWhere: Prisma.TransactionWhereInput = {
      ...where,
      type: TransactionType.CONTRIBUTION,
      ...(titheTypeId && {
        metadata: {
          path: ['contributionTypeId'],
          equals: titheTypeId,
        },
      }),
    };
    const totalTithes = await this.prisma.transaction.aggregate({
      where: tithesWhere,
      _sum: { amount: true },
    });

    // Total pledges
    const pledgesWhere: Prisma.TransactionWhereInput = {
      ...where,
      type: TransactionType.CONTRIBUTION,
      ...(pledgeTypeId && {
        metadata: {
          path: ['contributionTypeId'],
          equals: pledgeTypeId,
        },
      }),
    };
    const totalPledges = await this.prisma.transaction.aggregate({
      where: pledgesWhere,
      _sum: { amount: true },
    });

    // Total offerings
    const offeringsWhere: Prisma.TransactionWhereInput = {
      ...where,
      type: TransactionType.CONTRIBUTION,
      ...(offeringTypeId && {
        metadata: {
          path: ['contributionTypeId'],
          equals: offeringTypeId,
        },
      }),
    };
    const totalOfferings = await this.prisma.transaction.aggregate({
      where: offeringsWhere,
      _sum: { amount: true },
    });

    // Calculate net balance (income - expenses)
    const incomeAmount = totalIncome._sum?.amount?.toNumber() || 0;
    const expensesAmount = totalExpenses._sum?.amount?.toNumber() || 0;
    const netBalance = incomeAmount - expensesAmount;

    return {
      totalIncome: incomeAmount,
      totalExpenses: expensesAmount,
      totalTithes: totalTithes._sum?.amount?.toNumber() || 0,
      totalPledges: totalPledges._sum?.amount?.toNumber() || 0,
      totalOfferings: totalOfferings._sum?.amount?.toNumber() || 0,
      netBalance,
    };
  }

  async exportTransactions(params: {
    organisationId?: string;
    branchId?: string;
    fundId?: string;
    eventId?: string;
    type?: TransactionType;
    dateRange?: DateRangeInput;
    searchTerm?: string;
    format: string;
  }): Promise<string> {
    // 1. Query transactions using filter logic
    const filter: any = {
      ...(params.organisationId && { organisationId: params.organisationId }),
      ...(params.branchId && { branchId: params.branchId }),
      ...(params.fundId && { fundId: params.fundId }),
      ...(params.eventId && { eventId: params.eventId }),
      ...(params.type && { type: params.type }),
    };
    if (params.dateRange?.startDate || params.dateRange?.endDate) {
      filter.date = {};

      if (params.dateRange.startDate)
        filter.date.gte = params.dateRange.startDate;
      if (params.dateRange.endDate) filter.date.lte = params.dateRange.endDate;
    }
    if (params.searchTerm) {
      filter.OR = [
        { description: { contains: params.searchTerm, mode: 'insensitive' } },
        { reference: { contains: params.searchTerm, mode: 'insensitive' } },
      ];
    }
    const transactions = await this.prisma.transaction.findMany({
      where: filter,
      include: { fund: true, event: true },
      orderBy: { date: 'desc' },
    });
    console.log('[EXPORT] Transactions count:', transactions.length);

    // 2. Prepare export directory
    const exportDir = join(process.cwd(), 'public', 'exports');
    if (!existsSync(exportDir)) mkdirSync(exportDir, { recursive: true });
    const timestamp = Date.now();
    let filename = `transactions_${timestamp}`;
    let filePath = '';
    let publicUrl = '';

    // 3. Generate file by format
    switch (params.format.toLowerCase()) {
      case 'csv': {
        const fields = [
          'id',
          'date',
          'type',
          'amount',
          'fund.name',
          'event.title',
          'description',
          'reference',
          'createdAt',
          'updatedAt',
        ];
        const data = transactions.map((t) => ({
          ...t,
          'fund.name': t.fund?.name,
          'event.title': t.event?.title,
        }));
        const parser = new Json2CsvParser({ fields });
        const csv = parser.parse(data);
        filename += '.csv';
        filePath = join(exportDir, filename);
        console.log('[EXPORT] Writing CSV to:', filePath);
        writeFileSync(filePath, csv);
        publicUrl = `/exports/${filename}`;
        break;
      }
      case 'excel': {
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Transactions');
        sheet.columns = [
          { header: 'ID', key: 'id', width: 20 },
          { header: 'Date', key: 'date', width: 15 },
          { header: 'Type', key: 'type', width: 15 },
          { header: 'Amount', key: 'amount', width: 12 },
          { header: 'Fund', key: 'fund', width: 20 },
          { header: 'Event', key: 'event', width: 20 },
          { header: 'Description', key: 'description', width: 30 },
          { header: 'Reference', key: 'reference', width: 20 },
          { header: 'Created At', key: 'createdAt', width: 20 },
          { header: 'Updated At', key: 'updatedAt', width: 20 },
        ];
        transactions.forEach((t) => {
          sheet.addRow({
            id: t.id,
            date: t.date,
            type: t.type,
            amount: t.amount,
            fund: t.fund?.name,
            event: t.event?.title,
            description: t.description,
            reference: t.reference,
            createdAt: t.createdAt,
            updatedAt: t.updatedAt,
          });
        });
        filename += '.xlsx';
        filePath = join(exportDir, filename);
        console.log('[EXPORT] Writing Excel to:', filePath);
        await workbook.xlsx.writeFile(filePath);
        publicUrl = `/exports/${filename}`;
        break;
      }
      case 'pdf': {
        // TODO: Implement PDF export (using pdfkit or similar)
        // For now, throw error or return empty
        throw new Error('PDF export not implemented yet.');
      }
      default:
        throw new Error('Unsupported export format');
    }
    // 4. Return public URL for download
    const baseUrl = this.configService.get<string>('BASE_URL') || '';
    const fullUrl = baseUrl
      ? baseUrl.replace(/\/$/, '') + publicUrl
      : publicUrl;
    console.log('[EXPORT] Returning public URL:', fullUrl);
    return fullUrl;
  }

  async getCashFlowAnalysis(
    input: CashFlowAnalysisInput,
  ): Promise<CashFlowAnalysis> {
    console.log(
      'getCashFlowAnalysis - Raw input:',
      JSON.stringify(input, null, 2),
    );

    const { organisationId, branchId, dateRange, periodType, fundId } = input;

    console.log('getCashFlowAnalysis - Destructured values:', {
      organisationId,
      branchId,
      dateRange,
      periodType,
      fundId,
      organisationIdType: typeof organisationId,
      organisationIdTruthy: !!organisationId,
      dateRangeType: typeof dateRange,
      dateRangeTruthy: !!dateRange,
      dateRangeStartDate: dateRange?.startDate,
      dateRangeEndDate: dateRange?.endDate,
      dateRangeStartDateType: typeof dateRange?.startDate,
      dateRangeEndDateType: typeof dateRange?.endDate,
      dateRangeKeys: dateRange ? Object.keys(dateRange) : 'no dateRange',
    });

    // Validate required fields
    if (!organisationId) {
      throw new Error('organisationId is required for cash flow analysis');
    }

    // Ensure periodType has a valid value
    const effectivePeriodType = periodType || 'MONTHLY';

    // Provide default dateRange if missing or invalid - just make it work
    let effectiveStartDate: Date;
    let effectiveEndDate: Date;

    if (dateRange?.startDate && dateRange?.endDate) {
      effectiveStartDate = dateRange.startDate;
      effectiveEndDate = dateRange.endDate;
      console.log('Using provided date range:', {
        startDate: effectiveStartDate,
        endDate: effectiveEndDate,
        startDateISO: effectiveStartDate.toISOString(),
        endDateISO: effectiveEndDate.toISOString(),
      });
    } else {
      // Default to current year if dateRange is problematic
      effectiveStartDate = new Date(new Date().getFullYear(), 0, 1); // Start of current year
      effectiveEndDate = new Date(); // Today
      console.log('Using default date range:', {
        effectiveStartDate,
        effectiveEndDate,
      });
    }

    // Build where clause - use effective dates
    const where: Prisma.TransactionWhereInput = {
      organisationId,
      ...(branchId && { branchId }),
      ...(fundId && { fundId }),
      date: {
        gte: effectiveStartDate,
        lte: effectiveEndDate,
      },
    };

    // Get all transactions in the date range
    const transactions = await this.prisma.transaction.findMany({
      where,
      include: {
        fund: true,
      },
      orderBy: { date: 'asc' },
    });

    console.log('Financial Statements - Transaction Query Results:', {
      whereClause: where,
      transactionCount: transactions.length,
      dateRange: {
        start: effectiveStartDate.toISOString(),
        end: effectiveEndDate.toISOString(),
      },
      sampleTransactions: transactions.slice(0, 3).map((t) => ({
        id: t.id,
        date: t.date,
        type: t.type,
        amount: t.amount,
        fundName: t.fund?.name,
      })),
    });

    // Group transactions by period
    const periodData = this.groupTransactionsByPeriod(
      transactions,
      effectivePeriodType,
    );

    // Calculate cumulative flow
    let cumulativeFlow = 0;
    const cashFlowData: CashFlowData[] = periodData.map((period) => {
      const income = period.income;
      const expenses = period.expenses;
      const netFlow = income - expenses;
      cumulativeFlow += netFlow;

      return {
        period: period.period,
        income,
        expenses,
        netFlow,
        cumulativeFlow,
        incomeBreakdown: period.incomeBreakdown,
        expenseBreakdown: period.expenseBreakdown,
      };
    });

    // Calculate totals and averages
    const totalIncome = cashFlowData.reduce(
      (sum, data) => sum + data.income,
      0,
    );
    const totalExpenses = cashFlowData.reduce(
      (sum, data) => sum + data.expenses,
      0,
    );
    const totalNetFlow = totalIncome - totalExpenses;
    const periodCount = cashFlowData.length || 1;

    return {
      branchId: branchId || '',
      organisationId,
      periodStart: effectiveStartDate,
      periodEnd: effectiveEndDate,
      periodType: effectivePeriodType,
      data: cashFlowData,
      totalIncome,
      totalExpenses,
      totalNetFlow,
      averageMonthlyIncome: totalIncome / periodCount,
      averageMonthlyExpenses: totalExpenses / periodCount,
    };
  }

  async getComparativePeriodAnalysis(
    input: ComparativePeriodAnalysisInput,
  ): Promise<ComparativePeriodAnalysis> {
    const { organisationId, branchId, comparisonType, periods, fundId } = input;

    // Validate required fields
    if (!organisationId) {
      throw new Error(
        'organisationId is required for comparative period analysis',
      );
    }

    // Ensure comparisonType has a valid value
    const effectiveComparisonType =
      comparisonType || ComparisonType.YEAR_OVER_YEAR;
    const effectivePeriods = periods || 3;

    // Calculate date ranges for current and previous periods
    const periodRanges = this.calculateComparisonPeriods(
      effectiveComparisonType,
      effectivePeriods,
    );

    const comparativeData: ComparativePeriodData[] = [];

    for (const range of periodRanges) {
      // Get current period data
      const currentWhere: Prisma.TransactionWhereInput = {
        organisationId,
        ...(branchId && { branchId }),
        ...(fundId && { fundId }),
        date: {
          gte: range.currentStart,
          lte: range.currentEnd,
        },
      };

      // Get previous period data
      const previousWhere: Prisma.TransactionWhereInput = {
        organisationId,
        ...(branchId && { branchId }),
        ...(fundId && { fundId }),
        date: {
          gte: range.previousStart,
          lte: range.previousEnd,
        },
      };

      const [currentTransactions, previousTransactions] = await Promise.all([
        this.prisma.transaction.findMany({ where: currentWhere }),
        this.prisma.transaction.findMany({ where: previousWhere }),
      ]);

      const currentStats = this.calculatePeriodStats(currentTransactions);
      const previousStats = this.calculatePeriodStats(previousTransactions);

      // Calculate growth rates
      const incomeGrowthRate = this.calculateGrowthRate(
        previousStats.income,
        currentStats.income,
      );
      const expenseGrowthRate = this.calculateGrowthRate(
        previousStats.expenses,
        currentStats.expenses,
      );
      const netGrowthRate = this.calculateGrowthRate(
        previousStats.net,
        currentStats.net,
      );

      comparativeData.push({
        period: range.period,
        currentIncome: currentStats.income,
        previousIncome: previousStats.income,
        currentExpenses: currentStats.expenses,
        previousExpenses: previousStats.expenses,
        currentNet: currentStats.net,
        previousNet: previousStats.net,
        incomeGrowthRate,
        expenseGrowthRate,
        netGrowthRate,
        incomeVariance: currentStats.income - previousStats.income,
        expenseVariance: currentStats.expenses - previousStats.expenses,
        netVariance: currentStats.net - previousStats.net,
      });
    }

    // Calculate averages
    const avgIncomeGrowthRate =
      comparativeData.reduce((sum, data) => sum + data.incomeGrowthRate, 0) /
      comparativeData.length;
    const avgExpenseGrowthRate =
      comparativeData.reduce((sum, data) => sum + data.expenseGrowthRate, 0) /
      comparativeData.length;
    const avgNetGrowthRate =
      comparativeData.reduce((sum, data) => sum + data.netGrowthRate, 0) /
      comparativeData.length;

    // Determine trend
    const trend = this.determineTrend(avgNetGrowthRate);
    const insights = this.generateInsights(comparativeData, avgNetGrowthRate);

    return {
      branchId: branchId || '',
      organisationId,
      comparisonType: effectiveComparisonType,
      data: comparativeData,
      averageIncomeGrowthRate: avgIncomeGrowthRate,
      averageExpenseGrowthRate: avgExpenseGrowthRate,
      averageNetGrowthRate: avgNetGrowthRate,
      trend,
      insights,
    };
  }

  async getMemberGivingAnalysis(
    input: MemberGivingAnalysisInput,
  ): Promise<MemberGivingAnalysis> {
    const {
      memberId,
      organisationId,
      branchId,
      dateRange,
      includeRecentContributions,
      recentContributionsLimit,
    } = input;

    // Get member info
    const member = await this.prisma.member.findUnique({
      where: { id: memberId },
    });

    if (!member) {
      throw new Error(`Member with ID ${memberId} not found`);
    }

    // Build where clause for member contributions
    const where: Prisma.TransactionWhereInput = {
      memberId,
      organisationId,
      ...(branchId && { branchId }),
      type: TransactionType.CONTRIBUTION,
      date: {
        gte: dateRange.startDate,
        lte: dateRange.endDate,
      },
    };

    // Get all member contributions
    const contributions = await this.prisma.transaction.findMany({
      where,
      include: {
        fund: true,
      },
      orderBy: { date: 'desc' },
    });

    // Calculate basic stats
    const totalGiving = contributions.reduce(
      (sum, t) => sum + Number(t.amount),
      0,
    );
    const contributionCount = contributions.length;
    const averageGift =
      contributionCount > 0 ? totalGiving / contributionCount : 0;
    const firstGift =
      contributions.length > 0
        ? contributions[contributions.length - 1].date
        : null;
    const lastGift = contributions.length > 0 ? contributions[0].date : null;

    // Calculate giving trend
    const givingTrend = this.calculateGivingTrend(contributions);

    // Generate monthly breakdown
    const monthlyBreakdown = this.generateMonthlyGivingBreakdown(contributions);

    // Generate fund breakdown
    const fundBreakdown = this.generateFundGivingBreakdown(
      contributions,
      totalGiving,
    );

    // Get recent contributions
    const recentContributions = includeRecentContributions
      ? contributions.slice(0, recentContributionsLimit).map((t) => ({
          id: t.id,
          date: t.date,
          amount: t.amount.toNumber(),
          fundName: t.fund?.name,
          description: t.description || undefined,
          reference: t.reference || undefined,
        }))
      : [];

    // Calculate year-over-year change
    const yearOverYearChange = await this.calculateYearOverYearChange(
      memberId,
      organisationId,
      branchId,
      dateRange,
    );

    // Calculate giving rank and percentile
    const { givingRank, percentileRank } = await this.calculateMemberGivingRank(
      memberId,
      organisationId,
      branchId,
      dateRange,
    );

    return {
      memberId,
      memberName: `${member.firstName} ${member.lastName}`,
      memberEmail: member.email || undefined,
      periodStart: dateRange.startDate!,
      periodEnd: dateRange.endDate!,
      totalGiving,
      contributionCount,
      averageGift,
      firstGift: firstGift || undefined,
      lastGift: lastGift || undefined,
      givingTrend,
      monthlyBreakdown,
      fundBreakdown,
      recentContributions,
      yearOverYearChange,
      givingRank,
      percentileRank,
    };
  }

  private groupTransactionsByPeriod(
    transactions: any[],
    periodType: PeriodType,
  ) {
    const groups = new Map();

    transactions.forEach((transaction) => {
      const date = new Date(transaction.date);
      let periodKey: string;

      switch (periodType) {
        case PeriodType.MONTHLY:
          periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        case PeriodType.QUARTERLY:
          const quarter = Math.floor(date.getMonth() / 3) + 1;
          periodKey = `${date.getFullYear()}-Q${quarter}`;
          break;
        case PeriodType.YEARLY:
          periodKey = `${date.getFullYear()}`;
          break;
        default:
          periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }

      if (!groups.has(periodKey)) {
        groups.set(periodKey, {
          period: periodKey,
          income: 0,
          expenses: 0,
          incomeBreakdown: {},
          expenseBreakdown: {},
        });
      }

      const group = groups.get(periodKey);
      const amount = Number(transaction.amount);

      if (transaction.type === TransactionType.CONTRIBUTION) {
        group.income += amount;
        const fundName = transaction.fund?.name || 'General';
        group.incomeBreakdown[fundName] =
          (group.incomeBreakdown[fundName] || 0) + amount;
      } else if (transaction.type === TransactionType.EXPENSE) {
        group.expenses += amount;
        const category = transaction.description || 'Other';
        group.expenseBreakdown[category] =
          (group.expenseBreakdown[category] || 0) + amount;
      }
    });

    return Array.from(groups.values()).sort((a, b) =>
      a.period.localeCompare(b.period),
    );
  }

  private calculateComparisonPeriods(
    comparisonType: ComparisonType,
    periods: number,
  ): Array<{
    period: string;
    currentStart: Date;
    currentEnd: Date;
    previousStart: Date;
    previousEnd: Date;
  }> {
    const now = new Date();
    const ranges: Array<{
      period: string;
      currentStart: Date;
      currentEnd: Date;
      previousStart: Date;
      previousEnd: Date;
    }> = [];

    for (let i = 0; i < periods; i++) {
      let currentStart: Date,
        currentEnd: Date,
        previousStart: Date,
        previousEnd: Date,
        period: string;

      switch (comparisonType) {
        case ComparisonType.MONTH_OVER_MONTH:
          currentStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
          currentEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
          previousStart = new Date(
            now.getFullYear(),
            now.getMonth() - i - 1,
            1,
          );
          previousEnd = new Date(now.getFullYear(), now.getMonth() - i, 0);
          period = `${currentStart.getFullYear()}-${String(currentStart.getMonth() + 1).padStart(2, '0')}`;
          break;
        case ComparisonType.YEAR_OVER_YEAR:
          currentStart = new Date(now.getFullYear() - i, 0, 1);
          currentEnd = new Date(now.getFullYear() - i, 11, 31);
          previousStart = new Date(now.getFullYear() - i - 1, 0, 1);
          previousEnd = new Date(now.getFullYear() - i - 1, 11, 31);
          period = `${currentStart.getFullYear()}`;
          break;
        case ComparisonType.QUARTER_OVER_QUARTER:
          const currentQuarter = Math.floor(now.getMonth() / 3) - i;
          const currentYear =
            now.getFullYear() + Math.floor(currentQuarter / 4);
          const adjustedQuarter = ((currentQuarter % 4) + 4) % 4;
          currentStart = new Date(currentYear, adjustedQuarter * 3, 1);
          currentEnd = new Date(currentYear, adjustedQuarter * 3 + 3, 0);
          previousStart = new Date(currentYear, (adjustedQuarter - 1) * 3, 1);
          previousEnd = new Date(currentYear, adjustedQuarter * 3, 0);
          period = `${currentYear}-Q${adjustedQuarter + 1}`;
          break;
        default:
          // Default to monthly
          currentStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
          currentEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
          previousStart = new Date(
            now.getFullYear(),
            now.getMonth() - i - 1,
            1,
          );
          previousEnd = new Date(now.getFullYear(), now.getMonth() - i, 0);
          period = `${currentStart.getFullYear()}-${String(currentStart.getMonth() + 1).padStart(2, '0')}`;
          break;
      }

      ranges.push({
        period,
        currentStart,
        currentEnd,
        previousStart,
        previousEnd,
      });
    }

    return ranges;
  }

  private calculatePeriodStats(transactions: any[]): {
    income: number;
    expenses: number;
    net: number;
  } {
    const income = transactions
      .filter((t) => t.type === TransactionType.CONTRIBUTION)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const expenses = transactions
      .filter((t) => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return {
      income,
      expenses,
      net: income - expenses,
    };
  }

  private calculateGrowthRate(previous: number, current: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }

  private calculateGivingTrend(contributions: any[]): GivingTrend {
    if (contributions.length < 2) {
      return {
        direction: TrendDirection.STABLE,
        changePercent: 0,
        consistency: 0,
      };
    }

    // Sort by date ascending
    const sortedContributions = contributions.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    // Calculate trend using first half vs second half
    const midpoint = Math.floor(sortedContributions.length / 2);
    const firstHalf = sortedContributions.slice(0, midpoint);
    const secondHalf = sortedContributions.slice(midpoint);

    const firstHalfAvg =
      firstHalf.reduce((sum, t) => sum + Number(t.amount), 0) /
      firstHalf.length;
    const secondHalfAvg =
      secondHalf.reduce((sum, t) => sum + Number(t.amount), 0) /
      secondHalf.length;

    const changePercent = this.calculateGrowthRate(firstHalfAvg, secondHalfAvg);

    let direction: TrendDirection;
    if (changePercent > 5) direction = TrendDirection.INCREASING;
    else if (changePercent < -5) direction = TrendDirection.DECREASING;
    else direction = TrendDirection.STABLE;

    // Calculate consistency (regularity of giving)
    const consistency = this.calculateGivingConsistency(sortedContributions);

    return {
      direction,
      changePercent,
      consistency,
    };
  }

  private calculateGivingConsistency(contributions: any[]): number {
    if (contributions.length < 3) return 0;

    // Calculate coefficient of variation (lower = more consistent)
    const amounts = contributions.map((t) => Number(t.amount));
    const mean =
      amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length;
    const variance =
      amounts.reduce((sum, amount) => sum + Math.pow(amount - mean, 2), 0) /
      amounts.length;
    const stdDev = Math.sqrt(variance);
    const coefficientOfVariation = stdDev / mean;

    // Convert to consistency score (0-100, higher = more consistent)
    return Math.max(0, 100 - coefficientOfVariation * 100);
  }

  private generateMonthlyGivingBreakdown(
    contributions: any[],
  ): MonthlyGiving[] {
    const monthlyMap = new Map<string, { amount: number; count: number }>();

    contributions.forEach((contribution) => {
      const date = new Date(contribution.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const amount = Number(contribution.amount);

      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, { amount: 0, count: 0 });
      }

      const monthData = monthlyMap.get(monthKey)!;
      monthData.amount += amount;
      monthData.count += 1;
    });

    return Array.from(monthlyMap.entries())
      .map(([month, data]) => ({
        month,
        amount: data.amount,
        contributionCount: data.count,
        averageGift: data.amount / data.count,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  private generateFundGivingBreakdown(
    contributions: any[],
    totalGiving: number,
  ): FundGiving[] {
    const fundMap = new Map<
      string,
      { amount: number; count: number; name: string }
    >();

    contributions.forEach((contribution) => {
      const fundId = contribution.fundId || 'general';
      const fundName = contribution.fund?.name || 'General';
      const amount = Number(contribution.amount);

      if (!fundMap.has(fundId)) {
        fundMap.set(fundId, { amount: 0, count: 0, name: fundName });
      }

      const fundData = fundMap.get(fundId)!;
      fundData.amount += amount;
      fundData.count += 1;
    });

    return Array.from(fundMap.entries())
      .map(([fundId, data]) => ({
        fundId,
        fundName: data.name,
        totalAmount: data.amount,
        contributionCount: data.count,
        percentage: totalGiving > 0 ? (data.amount / totalGiving) * 100 : 0,
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount);
  }

  private async calculateYearOverYearChange(
    memberId: string,
    organisationId: string,
    branchId?: string,
    dateRange?: any,
  ): Promise<number> {
    const currentYear = new Date().getFullYear();
    const previousYear = currentYear - 1;

    const [currentYearGiving, previousYearGiving] = await Promise.all([
      this.prisma.transaction.aggregate({
        where: {
          memberId,
          organisationId,
          ...(branchId && { branchId }),
          type: TransactionType.CONTRIBUTION,
          date: {
            gte: new Date(currentYear, 0, 1),
            lte: new Date(currentYear, 11, 31),
          },
        },
        _sum: { amount: true },
      }),
      this.prisma.transaction.aggregate({
        where: {
          memberId,
          organisationId,
          ...(branchId && { branchId }),
          type: TransactionType.CONTRIBUTION,
          date: {
            gte: new Date(previousYear, 0, 1),
            lte: new Date(previousYear, 11, 31),
          },
        },
        _sum: { amount: true },
      }),
    ]);

    const current = Number(currentYearGiving._sum.amount) || 0;
    const previous = Number(previousYearGiving._sum.amount) || 0;

    return this.calculateGrowthRate(previous, current);
  }

  private async calculateMemberGivingRank(
    memberId: string,
    organisationId: string,
    branchId?: string,
    dateRange?: any,
  ): Promise<{ givingRank: number; percentileRank: number }> {
    // Get all members' giving totals for the period
    const memberGivingTotals = await this.prisma.transaction.groupBy({
      by: ['memberId'],
      where: {
        organisationId,
        ...(branchId && { branchId }),
        type: TransactionType.CONTRIBUTION,
        memberId: { not: null },
        ...(dateRange && {
          date: {
            gte: dateRange.startDate,
            lte: dateRange.endDate,
          },
        }),
      },
      _sum: { amount: true },
      orderBy: { _sum: { amount: 'desc' } },
    });

    // Find this member's rank
    const memberIndex = memberGivingTotals.findIndex(
      (m) => m.memberId === memberId,
    );
    const givingRank =
      memberIndex >= 0 ? memberIndex + 1 : memberGivingTotals.length + 1;

    // Calculate percentile rank
    const totalMembers = memberGivingTotals.length;
    const percentileRank =
      totalMembers > 0
        ? ((totalMembers - givingRank + 1) / totalMembers) * 100
        : 0;

    return { givingRank, percentileRank };
  }

  private determineTrend(avgNetGrowthRate: number): string {
    if (avgNetGrowthRate > 5) return 'IMPROVING';
    if (avgNetGrowthRate < -5) return 'DECLINING';
    return 'STABLE';
  }

  private generateInsights(
    data: ComparativePeriodData[],
    avgNetGrowthRate: number,
  ): string {
    const insights: string[] = [];

    if (avgNetGrowthRate > 10) {
      insights.push('Strong financial growth trend observed.');
    } else if (avgNetGrowthRate > 0) {
      insights.push('Positive financial growth trend.');
    } else if (avgNetGrowthRate < -10) {
      insights.push('Concerning decline in financial performance.');
    } else {
      insights.push('Financial performance is relatively stable.');
    }

    const incomeVolatility = this.calculateVolatility(
      data.map((d) => d.incomeGrowthRate),
    );
    if (incomeVolatility > 20) {
      insights.push('Income shows high volatility.');
    }

    const expenseVolatility = this.calculateVolatility(
      data.map((d) => d.expenseGrowthRate),
    );
    if (expenseVolatility > 20) {
      insights.push('Expenses show high volatility.');
    }

    return insights.join(' ');
  }

  private calculateVolatility(values: number[]): number {
    if (values.length < 2) return 0;

    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance =
      values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
      values.length;
    return Math.sqrt(variance);
  }

  async getFinancialStatements(
    input: FinancialStatementsInput,
  ): Promise<FinancialStatements> {
    console.log('getFinancialStatements called with input:', {
      input: JSON.stringify(input, null, 2),
      dateRange: input.dateRange,
      dateRangeType: typeof input.dateRange,
      startDate: input.dateRange?.startDate,
      startDateType: typeof input.dateRange?.startDate,
      endDate: input.dateRange?.endDate,
      endDateType: typeof input.dateRange?.endDate,
      dateRangeKeys: input.dateRange
        ? Object.keys(input.dateRange)
        : 'no dateRange',
    });

    const { organisationId, branchId, dateRange, statementType } = input;

    // Validate required fields
    if (!organisationId) {
      throw new Error('organisationId is required for financial statements');
    }

    // Ensure statementType has a valid value
    const effectiveStatementType =
      statementType || StatementType.INCOME_STATEMENT;

    // Provide default dateRange if missing or invalid - just make it work
    let effectiveStartDate: Date;
    let effectiveEndDate: Date;

    if (dateRange?.startDate && dateRange?.endDate) {
      // Ensure dates are proper Date objects (handle string conversion)
      effectiveStartDate =
        dateRange.startDate instanceof Date
          ? dateRange.startDate
          : new Date(dateRange.startDate);
      effectiveEndDate =
        dateRange.endDate instanceof Date
          ? dateRange.endDate
          : new Date(dateRange.endDate);

      // Validate that the dates are valid
      if (
        isNaN(effectiveStartDate.getTime()) ||
        isNaN(effectiveEndDate.getTime())
      ) {
        console.warn('Invalid dates provided, using defaults:', {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        });
        effectiveStartDate = new Date(new Date().getFullYear(), 0, 1);
        effectiveEndDate = new Date();
      } else {
        console.log('Using provided date range:', {
          startDate: effectiveStartDate,
          endDate: effectiveEndDate,
          startDateISO: effectiveStartDate.toISOString(),
          endDateISO: effectiveEndDate.toISOString(),
        });
      }
    } else {
      // Default to current year if dateRange is problematic
      effectiveStartDate = new Date(new Date().getFullYear(), 0, 1); // Start of current year
      effectiveEndDate = new Date(); // Today
      console.log('Using default date range:', {
        effectiveStartDate,
        effectiveEndDate,
      });
    }

    // Build where clause - use effective dates
    const where: Prisma.TransactionWhereInput = {
      organisationId,
      ...(branchId && { branchId }),
      date: {
        gte: effectiveStartDate,
        lte: effectiveEndDate,
      },
    };

    // Get all transactions in the date range
    const transactions = await this.prisma.transaction.findMany({
      where,
      include: {
        fund: true,
      },
      orderBy: { date: 'asc' },
    });

    console.log('Financial Statements - Transaction Query Results:', {
      whereClause: where,
      transactionCount: transactions.length,
      dateRange: {
        start: effectiveStartDate.toISOString(),
        end: effectiveEndDate.toISOString(),
      },
      sampleTransactions: transactions.slice(0, 3).map((t) => ({
        id: t.id,
        date: t.date,
        type: t.type,
        amount: t.amount,
        fundName: t.fund?.name,
      })),
    });

    // Base financial statements object
    const baseStatements: FinancialStatements = {
      branchId: branchId || '',
      organisationId,
      statementType: effectiveStatementType,
      periodStart: effectiveStartDate,
      periodEnd: effectiveEndDate,
      generatedAt: new Date(),
    };

    // Generate specific statement based on type
    switch (effectiveStatementType) {
      case StatementType.INCOME_STATEMENT:
        const incomeStatement = this.generateIncomeStatement(
          transactions,
          effectiveStartDate,
          effectiveEndDate,
          branchId || '',
          organisationId,
        );
        return { ...baseStatements, incomeStatement };

      case StatementType.BALANCE_SHEET:
        const balanceSheet = this.generateBalanceSheet(
          transactions,
          effectiveEndDate,
          branchId || '',
          organisationId,
        );
        return { ...baseStatements, balanceSheet };

      case StatementType.CASH_FLOW_STATEMENT:
        const cashFlowStatement = this.generateCashFlowStatement(
          transactions,
          effectiveStartDate,
          effectiveEndDate,
          branchId || '',
          organisationId,
        );
        return { ...baseStatements, cashFlowStatement };

      case StatementType.STATEMENT_OF_NET_ASSETS:
        const statementOfNetAssets = this.generateStatementOfNetAssets(
          transactions,
          effectiveStartDate,
          effectiveEndDate,
          branchId || '',
          organisationId,
        );
        return { ...baseStatements, statementOfNetAssets };

      default:
        throw new Error('Unsupported financial statement type');
    }
  }

  private generateIncomeStatement(
    transactions: any[],
    periodStart: Date,
    periodEnd: Date,
    branchId: string,
    organisationId: string,
  ): IncomeStatement {
    // Group revenue by fund
    const revenueByFund = new Map<string, number>();
    const expensesByCategory = new Map<string, number>();

    let totalRevenue = 0;
    let totalExpenses = 0;

    transactions.forEach((transaction) => {
      const amount = Number(transaction.amount);

      if (transaction.type === TransactionType.CONTRIBUTION) {
        const fundName = transaction.fund?.name || 'General Fund';
        revenueByFund.set(
          fundName,
          (revenueByFund.get(fundName) || 0) + amount,
        );
        totalRevenue += amount;
      } else if (transaction.type === TransactionType.EXPENSE) {
        const category = transaction.description || 'Other Expenses';
        expensesByCategory.set(
          category,
          (expensesByCategory.get(category) || 0) + amount,
        );
        totalExpenses += amount;
      }
    });

    // Convert to FinancialLineItem arrays
    const revenue: FinancialLineItem[] = Array.from(
      revenueByFund.entries(),
    ).map(([fund, amount]) => ({
      category: 'Revenue',
      description: fund,
      currentPeriod: amount,
    }));

    const expenses: FinancialLineItem[] = Array.from(
      expensesByCategory.entries(),
    ).map(([category, amount]) => ({
      category: 'Expenses',
      description: category,
      currentPeriod: amount,
    }));

    return {
      branchId,
      organisationId,
      periodStart,
      periodEnd,
      revenue,
      expenses,
      totalRevenue,
      totalExpenses,
      netIncome: totalRevenue - totalExpenses,
    };
  }

  private generateBalanceSheet(
    transactions: any[],
    asOfDate: Date,
    branchId: string,
    organisationId: string,
  ): BalanceSheet {
    // For a simple balance sheet, we'll show fund balances as assets
    const fundBalances = new Map<string, number>();
    let totalAssets = 0;

    transactions.forEach((transaction) => {
      const amount = Number(transaction.amount);
      const fundName = transaction.fund?.name || 'General Fund';

      if (transaction.type === TransactionType.CONTRIBUTION) {
        fundBalances.set(fundName, (fundBalances.get(fundName) || 0) + amount);
        totalAssets += amount;
      } else if (transaction.type === TransactionType.EXPENSE) {
        fundBalances.set(fundName, (fundBalances.get(fundName) || 0) - amount);
        totalAssets -= amount;
      }
    });

    const assets: FinancialLineItem[] = Array.from(fundBalances.entries()).map(
      ([fund, balance]) => ({
        category: 'Assets',
        description: `${fund} Balance`,
        currentPeriod: Math.max(0, balance), // Only show positive balances as assets
      }),
    );

    // For churches, liabilities are typically minimal, so we'll show net assets
    const netAssets: FinancialLineItem[] = [
      {
        category: 'Net Assets',
        description: 'Unrestricted Net Assets',
        currentPeriod: totalAssets,
      },
    ];

    return {
      branchId,
      organisationId,
      asOfDate,
      assets,
      liabilities: [], // Minimal liabilities for churches
      netAssets,
      totalAssets,
      totalLiabilities: 0,
      totalNetAssets: totalAssets,
    };
  }

  private generateCashFlowStatement(
    transactions: any[],
    periodStart: Date,
    periodEnd: Date,
    branchId: string,
    organisationId: string,
  ): CashFlowStatement {
    let netCashFromOperating = 0;
    let netCashFromInvesting = 0;
    let netCashFromFinancing = 0;

    const operatingActivities: FinancialLineItem[] = [];
    const investingActivities: FinancialLineItem[] = [];
    const financingActivities: FinancialLineItem[] = [];

    // Group transactions by type for cash flow
    const contributionsByFund = new Map<string, number>();
    const expensesByCategory = new Map<string, number>();

    transactions.forEach((transaction) => {
      const amount = Number(transaction.amount);

      if (transaction.type === TransactionType.CONTRIBUTION) {
        const fundName = transaction.fund?.name || 'General Fund';
        contributionsByFund.set(
          fundName,
          (contributionsByFund.get(fundName) || 0) + amount,
        );
        netCashFromOperating += amount;
      } else if (transaction.type === TransactionType.EXPENSE) {
        const category = transaction.description || 'Operating Expenses';
        expensesByCategory.set(
          category,
          (expensesByCategory.get(category) || 0) + amount,
        );
        netCashFromOperating -= amount;
      }
    });

    // Convert to line items
    Array.from(contributionsByFund.entries()).forEach(([fund, amount]) => {
      operatingActivities.push({
        category: 'Operating',
        description: `Contributions - ${fund}`,
        currentPeriod: amount,
      });
    });

    Array.from(expensesByCategory.entries()).forEach(([category, amount]) => {
      operatingActivities.push({
        category: 'Operating',
        description: category,
        currentPeriod: -amount, // Negative for cash outflow
      });
    });

    return {
      branchId,
      organisationId,
      periodStart,
      periodEnd,
      operatingActivities,
      investingActivities,
      financingActivities,
      netCashFromOperating,
      netCashFromInvesting,
      netCashFromFinancing,
      netChangeInCash:
        netCashFromOperating + netCashFromInvesting + netCashFromFinancing,
      beginningCashBalance: 0, // Would need additional data to calculate
      endingCashBalance:
        netCashFromOperating + netCashFromInvesting + netCashFromFinancing,
    };
  }

  private generateStatementOfNetAssets(
    transactions: any[],
    periodStart: Date,
    periodEnd: Date,
    branchId: string,
    organisationId: string,
  ): StatementOfNetAssets {
    // For churches, most assets are typically unrestricted
    let totalUnrestricted = 0;
    let totalTemporarilyRestricted = 0;
    let totalPermanentlyRestricted = 0;

    const unrestrictedItems: FinancialLineItem[] = [];
    const fundBalances = new Map<string, number>();

    transactions.forEach((transaction) => {
      const amount = Number(transaction.amount);
      const fundName = transaction.fund?.name || 'General Fund';

      if (transaction.type === TransactionType.CONTRIBUTION) {
        fundBalances.set(fundName, (fundBalances.get(fundName) || 0) + amount);
        totalUnrestricted += amount;
      } else if (transaction.type === TransactionType.EXPENSE) {
        fundBalances.set(fundName, (fundBalances.get(fundName) || 0) - amount);
        totalUnrestricted -= amount;
      }
    });

    Array.from(fundBalances.entries()).forEach(([fund, balance]) => {
      if (balance > 0) {
        unrestrictedItems.push({
          category: 'Unrestricted',
          description: fund,
          currentPeriod: balance,
        });
      }
    });

    return {
      branchId,
      organisationId,
      periodStart,
      periodEnd,
      unrestricted: unrestrictedItems,
      temporarilyRestricted: [],
      permanentlyRestricted: [],
      totalUnrestricted,
      totalTemporarilyRestricted,
      totalPermanentlyRestricted,
      totalNetAssets:
        totalUnrestricted +
        totalTemporarilyRestricted +
        totalPermanentlyRestricted,
    };
  }

  async getBudgetVsActual(input: BudgetVsActualInput): Promise<BudgetVsActual> {
    const { organisationId, branchId, dateRange, periodType, fundId } = input;

    console.log('getBudgetVsActual called with input:', {
      input: JSON.stringify(input, null, 2),
      dateRange: input.dateRange,
      dateRangeType: typeof input.dateRange,
    });

    // Validate required fields
    if (!organisationId) {
      throw new Error(
        'organisationId is required for budget vs actual analysis',
      );
    }

    // Provide default dateRange if missing or invalid
    let effectiveStartDate: Date;
    let effectiveEndDate: Date;

    if (dateRange?.startDate && dateRange?.endDate) {
      effectiveStartDate = dateRange.startDate;
      effectiveEndDate = dateRange.endDate;
    } else {
      // Default to current year
      effectiveStartDate = new Date(new Date().getFullYear(), 0, 1);
      effectiveEndDate = new Date();
    }

    const effectivePeriodType = periodType || BudgetPeriodType.MONTHLY;

    console.log('Using date range for budget analysis:', {
      startDate: effectiveStartDate,
      endDate: effectiveEndDate,
      periodType: effectivePeriodType,
    });

    // Get real budget data from database
    const budgetWhere: Prisma.BudgetWhereInput = {
      organisationId,
      ...(branchId && { branchId }),
      ...(fundId && { fundId }),
      // Find budgets that overlap with the requested date range
      OR: [
        {
          AND: [
            { startDate: { lte: effectiveEndDate } },
            { endDate: { gte: effectiveStartDate } },
          ],
        },
      ],
    };

    const budgets = await this.prisma.budget.findMany({
      where: budgetWhere,
      include: {
        budgetItems: {
          include: {
            expenseCategory: true,
          },
        },
        fund: true,
      },
      orderBy: { startDate: 'asc' },
    });

    console.log('Budget Query Results:', {
      whereClause: budgetWhere,
      budgetCount: budgets.length,
      budgets: budgets.map((b) => ({
        id: b.id,
        name: b.name,
        startDate: b.startDate,
        endDate: b.endDate,
        totalAmount: b.totalAmount,
        itemCount: b.budgetItems.length,
      })),
    });

    // Get actual transactions for the period
    const transactionWhere: Prisma.TransactionWhereInput = {
      organisationId,
      ...(branchId && { branchId }),
      ...(fundId && { fundId }),
      date: {
        gte: effectiveStartDate,
        lte: effectiveEndDate,
      },
    };

    const transactions = await this.prisma.transaction.findMany({
      where: transactionWhere,
      include: { fund: true },
      orderBy: { date: 'asc' },
    });

    console.log('Budget Analysis - Transaction Query Results:', {
      whereClause: transactionWhere,
      transactionCount: transactions.length,
      dateRange: {
        start: effectiveStartDate.toISOString(),
        end: effectiveEndDate.toISOString(),
      },
      transactionFunds: transactions.map((t) => ({
        id: t.id,
        type: t.type,
        amount: t.amount,
        fundName: t.fund?.name || 'No Fund',
        description: t.description,
      })),
    });

    // Process real budget data
    const budgetedRevenue = new Map<string, number>();
    const budgetedExpenses = new Map<string, number>();

    console.log('Processing budgets for categorization:', {
      budgets: budgets.map((b) => ({
        id: b.id,
        name: b.name,
        fundName: b.fund?.name || 'No Fund',
        totalAmount: b.totalAmount,
        budgetItemsCount: b.budgetItems?.length || 0,
      })),
    });

    budgets.forEach((budget) => {
      const fundName = budget.fund?.name || 'General';

      // Improved budget categorization logic
      // If budget has budget items, it's likely an expense budget
      if (budget.budgetItems && budget.budgetItems.length > 0) {
        // For expense budgets, sum up budget items
        budget.budgetItems.forEach((item) => {
          const categoryName =
            item.expenseCategory?.name || item.name || 'Other Expenses';
          budgetedExpenses.set(
            categoryName,
            (budgetedExpenses.get(categoryName) || 0) + item.amount,
          );
        });
      } else {
        // If no budget items, treat as revenue budget (most common case)
        // This handles all fund types: tithes, offerings, donations, general fund, etc.
        budgetedRevenue.set(
          fundName,
          (budgetedRevenue.get(fundName) || 0) + budget.totalAmount,
        );
      }

      // Additional check: if fund name suggests revenue, always include as revenue
      if (
        budget.fund?.name &&
        (budget.fund.name.toLowerCase().includes('tithe') ||
          budget.fund.name.toLowerCase().includes('offering') ||
          budget.fund.name.toLowerCase().includes('donation') ||
          budget.fund.name.toLowerCase().includes('contribution') ||
          budget.fund.name.toLowerCase().includes('income') ||
          budget.fund.name.toLowerCase().includes('revenue'))
      ) {
        budgetedRevenue.set(
          fundName,
          (budgetedRevenue.get(fundName) || 0) + budget.totalAmount,
        );
      }
    });

    // Generate budget line items from real data
    const revenueItems: BudgetLineItem[] = [];
    const expenseItems: BudgetLineItem[] = [];

    // Revenue items from real budget data
    budgetedRevenue.forEach((budgetedAmount, category) => {
      const matchingTransactions = transactions.filter(
        (t) =>
          t.type === TransactionType.CONTRIBUTION && t.fund?.name === category,
      );
      const actualAmount = matchingTransactions.reduce(
        (sum, t) => sum + Number(t.amount),
        0,
      );

      console.log('Revenue category matching:', {
        category,
        budgetedAmount,
        matchingTransactionsCount: matchingTransactions.length,
        actualAmount,
        allContributionTransactions: transactions.filter(
          (t) => t.type === TransactionType.CONTRIBUTION,
        ).length,
        availableFunds: [
          ...new Set(transactions.map((t) => t.fund?.name).filter(Boolean)),
        ],
      });

      const variance = actualAmount - budgetedAmount;
      const variancePercent =
        budgetedAmount > 0 ? (variance / budgetedAmount) * 100 : 0;

      revenueItems.push({
        category: 'Revenue',
        description: category,
        budgetedAmount,
        actualAmount,
        variance,
        variancePercent,
        status: variance >= 0 ? 'on_target' : 'under_budget',
        fundName: category,
        period: this.formatPeriod(
          effectiveStartDate,
          effectiveEndDate,
          effectivePeriodType,
        ),
      });
    });

    // Expense items from real budget data
    budgetedExpenses.forEach((budgetedAmount, category) => {
      const actualAmount = transactions
        .filter(
          (t) =>
            t.type === TransactionType.EXPENSE && t.description === category,
        )
        .reduce((sum, t) => sum + Number(t.amount), 0);
      const variance = budgetedAmount - actualAmount; // Positive variance = under budget (good)
      const variancePercent =
        budgetedAmount > 0 ? (variance / budgetedAmount) * 100 : 0;

      expenseItems.push({
        category: 'Expenses',
        description: category,
        budgetedAmount,
        actualAmount,
        variance,
        variancePercent,
        status: variance >= 0 ? 'under_budget' : 'over_budget',
        fundName: category,
        period: this.formatPeriod(
          effectiveStartDate,
          effectiveEndDate,
          effectivePeriodType,
        ),
      });
    });

    // Calculate summary
    const totalBudgetedRevenue = Array.from(budgetedRevenue.values()).reduce(
      (sum, amount) => sum + amount,
      0,
    );
    const totalBudgetedExpenses = Array.from(budgetedExpenses.values()).reduce(
      (sum, amount) => sum + amount,
      0,
    );
    const totalBudgeted = totalBudgetedRevenue - totalBudgetedExpenses;
    const totalActual =
      transactions
        .filter((t) => t.type === TransactionType.CONTRIBUTION)
        .reduce((sum, t) => sum + Number(t.amount), 0) -
      transactions
        .filter((t) => t.type === TransactionType.EXPENSE)
        .reduce((sum, t) => sum + Number(t.amount), 0);
    const totalVariance = totalActual - totalBudgeted;
    const totalVariancePercent =
      totalBudgeted > 0 ? (totalVariance / totalBudgeted) * 100 : 0;
    const budgetUtilization =
      totalBudgetedExpenses > 0
        ? (transactions
            .filter((t) => t.type === TransactionType.EXPENSE)
            .reduce((sum, t) => sum + Number(t.amount), 0) /
            totalBudgetedExpenses) *
          100
        : 0;

    const summary: BudgetSummary = {
      totalBudgeted,
      totalActual,
      totalVariance,
      totalVariancePercent,
      budgetUtilization,
      overallStatus: totalVariance >= 0 ? 'on_target' : 'over_budget',
    };

    const notes =
      budgets.length === 0
        ? 'No budget records found for the selected period. Please create budget records to enable budget vs actual analysis.'
        : `Analysis based on ${budgets.length} budget record(s) for the selected period.`;

    return {
      organisationId,
      branchId: branchId || '',
      periodStart: effectiveStartDate,
      periodEnd: effectiveEndDate,
      periodType: effectivePeriodType,
      summary,
      revenueItems,
      expenseItems,
      generatedAt: new Date(),
      notes,
    };
  }

  private formatPeriod(
    startDate: Date,
    endDate: Date,
    periodType: BudgetPeriodType,
  ): string {
    if (periodType === BudgetPeriodType.MONTHLY) {
      return startDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
      });
    } else if (periodType === BudgetPeriodType.QUARTERLY) {
      const quarter = Math.ceil((startDate.getMonth() + 1) / 3);
      return `Q${quarter} ${startDate.getFullYear()}`;
    } else {
      return startDate.getFullYear().toString();
    }
  }

  findOne(id: string) {
    return this.prisma.transaction.findUnique({ where: { id } });
  }

  update(id: string, data: UpdateTransactionInput) {
    return this.prisma.transaction.update({
      where: { id },
      data,
    });
  }

  remove(id: string) {
    return this.prisma.transaction.delete({ where: { id } });
  }
}
