import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ReportFilterInput } from '../dto/report-filter.input';
import { Prisma } from '@prisma/client';
import { Contribution } from '../../contributions/entities/contribution.entity';

// --- Interface Definitions for Report Data ---

interface FundBreakdownItem {
  name: string;
  amount: number;
  percentage: number;
}

interface PaymentMethodBreakdownItem {
  method: string;
  amount: number;
  percentage: number;
}

interface TrendDataItem {
  date: Date;
  amount: number;
}

export interface ContributionsReportData {
  totalAmount: number;
  contributionCount: number;
  fundBreakdown: FundBreakdownItem[];
  paymentMethodBreakdown: PaymentMethodBreakdownItem[];
  trendData: TrendDataItem[];
  dateRange?: {
    startDate?: Date;
    endDate?: Date;
  };
  branchId?: string;
  organisationId?: string;
  branchName?: string;
}

interface BudgetCategoryItem {
  name: string;
  budgeted: number;
  actual: number;
  variance: number;
  percentVariance: number;
}

interface BudgetTotals {
  budgeted: number;
  actual: number;
  variance: number;
  percentVariance: number;
}

export interface BudgetVsActualReportData {
  branchId?: string;
  organisationId?: string;
  startDate?: Date;
  endDate?: Date;
  categories: BudgetCategoryItem[];
  totals: BudgetTotals;
}

interface PledgeItem {
  id: string;
  amount: number;
  amountFulfilled: number;
  fulfillmentPercentage: number;
  startDate: Date;
  endDate?: Date | null;
  frequency: string;
  status: string;
  memberName?: string;
  fundName?: string;
}

export interface PledgeFulfillmentReportData {
  branchId?: string;
  organisationId?: string;
  fundId?: string;
  totalPledged: number;
  totalFulfilled: number;
  fulfillmentRate: number;
  pledgeCount: number;
  fullyFulfilledCount: number;
  partiallyFulfilledCount: number;
  unfulfilled: number;
  pledges: PledgeItem[];
}

@Injectable()
export class FinancialReportsService {
  private readonly logger = new Logger(FinancialReportsService.name);

  constructor(private prisma: PrismaService) {}

  async getContributionsReport(filters: ReportFilterInput): Promise<{
    contributions: Contribution[];
    total: number;
    count: number;
  }> {
    try {
      const { branchId, organisationId, dateRange, fundId } = filters;

      const where: Prisma.ContributionWhereInput = {};

      if (branchId) {
        where.branchId = branchId;
      }

      if (organisationId) {
        where.organisationId = organisationId;
      }

      // We'll handle member lookup differently since userId isn't in the filter

      if (fundId) {
        where.fundId = fundId;
      }

      if (dateRange?.startDate && dateRange?.endDate) {
        where.date = {
          gte: new Date(dateRange.startDate),
          lte: new Date(dateRange.endDate),
        };
      }

      const contributions = await this.prisma.contribution.findMany({
        where,
        include: {
          member: true,
          fund: true,
          paymentMethod: true,
          batch: true,
        },
      });

      const total = contributions.reduce((sum, c) => sum + c.amount, 0);

      // Convert the Prisma model to our entity type
      const contributionEntities: Contribution[] = contributions.map((c) => ({
        id: c.id,
        amount: c.amount,
        date: c.date,
        contributionTypeId: c.contributionTypeId,
        paymentMethodId: c.paymentMethodId,
        notes: c.notes || undefined,
        memberId: c.memberId || undefined,
        anonymous: c.isAnonymous || undefined,
        fundId: c.fundId,
        pledgeId: c.pledgeId || undefined,
        branchId: c.branchId || undefined,
        organisationId: c.organisationId || undefined,
      }));

      return {
        contributions: contributionEntities,
        total,
        count: contributions.length,
      };
    } catch (error) {
      this.logger.error('Failed to get contributions report', error.stack);
      throw new Error('Could not retrieve contributions report.');
    }
  }

  async getBudgetVsActualReport(
    filter: ReportFilterInput,
  ): Promise<BudgetVsActualReportData> {
    try {
      const { branchId, organisationId, dateRange } = filter;

      // Build the where clause for budgets
      const budgetWhere: Prisma.BudgetWhereInput = {};

      if (branchId) {
        budgetWhere.branchId = branchId;
      }

      if (organisationId) {
        budgetWhere.organisationId = organisationId;
      }

      // If date range is provided, find budgets that overlap with the date range
      if (dateRange?.startDate && dateRange?.endDate) {
        budgetWhere.OR = [
          {
            startDate: {
              lte: new Date(dateRange.endDate),
            },
            endDate: {
              gte: new Date(dateRange.startDate),
            },
          },
        ];
      } else {
        // Default to current fiscal year if no date range provided
        const currentYear = new Date().getFullYear();
        budgetWhere.fiscalYear = currentYear;
      }

      // Get active budgets
      budgetWhere.status = 'ACTIVE';

      // Fetch budgets with their budget items
      const budgets = await this.prisma.budget.findMany({
        where: budgetWhere,
        include: {
          budgetItems: {
            include: {
              expenseCategory: true,
            },
          },
        },
      });

      if (budgets.length === 0) {
        return {
          branchId,
          organisationId,
          startDate: dateRange?.startDate,
          endDate: dateRange?.endDate,
          categories: [],
          totals: {
            budgeted: 0,
            actual: 0,
            variance: 0,
            percentVariance: 0,
          },
        };
      }

      // Group budget items by expense category
      const categoryMap = new Map<
        string,
        { name: string; budgeted: number; actual: number }
      >();

      // Process budget items
      for (const budget of budgets) {
        for (const item of budget.budgetItems) {
          const categoryName = item.expenseCategory?.name || 'Uncategorized';
          const existing = categoryMap.get(categoryName) || {
            name: categoryName,
            budgeted: 0,
            actual: 0,
          };
          existing.budgeted += item.amount;
          categoryMap.set(categoryName, existing);
        }
      }

      // Build expense where clause to match the same filters
      const expenseWhere: Prisma.ExpenseWhereInput = {};

      if (branchId) {
        expenseWhere.branchId = branchId;
      }

      if (organisationId) {
        expenseWhere.organisationId = organisationId;
      }

      // Match expenses to the same date range as budgets
      if (dateRange?.startDate && dateRange?.endDate) {
        expenseWhere.date = {
          gte: new Date(dateRange.startDate),
          lte: new Date(dateRange.endDate),
        };
      } else {
        // Use the date range from the first budget if available
        if (budgets.length > 0) {
          expenseWhere.date = {
            gte: budgets[0].startDate,
            lte: budgets[0].endDate,
          };
        }
      }

      // Get expenses grouped by category
      const expenses = await this.prisma.expense.findMany({
        where: expenseWhere,
        include: {
          expenseCategory: true,
        },
      });

      // Add expense amounts to the category map
      for (const expense of expenses) {
        const categoryName = expense.expenseCategory?.name || 'Uncategorized';
        const existing = categoryMap.get(categoryName) || {
          name: categoryName,
          budgeted: 0,
          actual: 0,
        };
        existing.actual += expense.amount;
        categoryMap.set(categoryName, existing);
      }

      // Calculate variances and create the final categories array
      const categories: BudgetCategoryItem[] = Array.from(
        categoryMap.values(),
      ).map(({ name, budgeted, actual }) => {
        const variance = budgeted - actual;
        const percentVariance = budgeted > 0 ? (variance / budgeted) * 100 : 0;

        return {
          name,
          budgeted,
          actual,
          variance,
          percentVariance: Number(percentVariance.toFixed(2)),
        };
      });

      // Calculate totals
      const totals = categories.reduce(
        (acc, category) => {
          acc.budgeted += category.budgeted;
          acc.actual += category.actual;
          acc.variance += category.variance;
          return acc;
        },
        { budgeted: 0, actual: 0, variance: 0, percentVariance: 0 },
      );

      // Calculate overall percent variance
      totals.percentVariance =
        totals.budgeted > 0
          ? Number(((totals.variance / totals.budgeted) * 100).toFixed(2))
          : 0;

      return {
        branchId,
        organisationId,
        startDate:
          dateRange?.startDate ||
          (budgets.length > 0 ? budgets[0].startDate : undefined),
        endDate:
          dateRange?.endDate ||
          (budgets.length > 0 ? budgets[0].endDate : undefined),
        categories,
        totals,
      };
    } catch (error) {
      this.logger.error('Failed to get budget vs actual report', error.stack);
      throw new Error('Could not retrieve budget vs actual report.');
    }
  }

  async getPledgeFulfillmentReport(
    filter: ReportFilterInput,
    fundId?: string,
  ): Promise<PledgeFulfillmentReportData> {
    try {
      const { branchId, organisationId, dateRange } = filter;

      // Build the where clause for pledges
      const pledgeWhere: Prisma.PledgeWhereInput = {};

      if (branchId) {
        pledgeWhere.branchId = branchId;
      }

      if (organisationId) {
        pledgeWhere.organisationId = organisationId;
      }

      if (fundId) {
        pledgeWhere.fundId = fundId;
      }

      // Filter by date range if provided
      if (dateRange?.startDate && dateRange?.endDate) {
        pledgeWhere.OR = [
          {
            startDate: {
              lte: new Date(dateRange.endDate),
            },
            endDate: {
              gte: new Date(dateRange.startDate),
            },
          },
          {
            startDate: {
              lte: new Date(dateRange.endDate),
            },
            endDate: null,
          },
        ];
      }

      // Get active pledges with their contributions
      const pledges = await this.prisma.pledge.findMany({
        where: pledgeWhere,
        include: {
          member: true,
          fund: true,
          contributions: true,
        },
      });

      // Calculate pledge metrics
      let totalPledged = 0;
      let totalFulfilled = 0;
      let fullyFulfilledCount = 0;
      let partiallyFulfilledCount = 0;
      let unfulfilledCount = 0;

      const pledgeItems: PledgeItem[] = pledges.map((pledge) => {
        // Calculate fulfillment percentage for this pledge
        const fulfillmentPercentage =
          pledge.amount > 0
            ? (pledge.amountFulfilled / pledge.amount) * 100
            : 0;

        // Update counts based on fulfillment status
        if (fulfillmentPercentage >= 100) {
          fullyFulfilledCount++;
        } else if (fulfillmentPercentage > 0) {
          partiallyFulfilledCount++;
        } else {
          unfulfilledCount++;
        }

        // Update totals
        totalPledged += pledge.amount;
        totalFulfilled += pledge.amountFulfilled;

        // Return pledge item with additional calculated fields
        return {
          id: pledge.id,
          amount: pledge.amount,
          amountFulfilled: pledge.amountFulfilled,
          fulfillmentPercentage: Number(fulfillmentPercentage.toFixed(2)),
          startDate: pledge.startDate,
          endDate: pledge.endDate,
          frequency: pledge.frequency,
          status: pledge.status,
          memberName: pledge.member?.firstName + ' ' + pledge.member?.lastName,
          fundName: pledge.fund?.name,
        };
      });

      // Calculate overall fulfillment rate
      const fulfillmentRate =
        totalPledged > 0
          ? Number(((totalFulfilled / totalPledged) * 100).toFixed(2))
          : 0;

      return {
        branchId,
        organisationId,
        fundId,
        totalPledged,
        totalFulfilled,
        fulfillmentRate,
        pledgeCount: pledges.length,
        fullyFulfilledCount,
        partiallyFulfilledCount,
        unfulfilled: unfulfilledCount,
        pledges: pledgeItems,
      };
    } catch (error) {
      this.logger.error('Failed to get pledge fulfillment report', error.stack);
      throw new Error('Could not retrieve pledge fulfillment report.');
    }
  }
}
