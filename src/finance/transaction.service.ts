import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionInput } from './dto/create-transaction.input';
import { UpdateTransactionInput } from './dto/update-transaction.input';
import { Prisma, TransactionType } from '@prisma/client';
import { DateRangeInput } from '../common/dto/date-range.input';
import { TransactionStats } from './dto/transaction-stats.dto';

@Injectable()
export class TransactionService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateTransactionInput) {
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
      amount,
      type,
      date,
      description,
      reference,
      metadata,
    } = data;

    return this.prisma.transaction.create({
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
      },
    });
  }

  async findAll(params: {
    organisationId?: string;
    branchId?: string;
    userId?: string;
    type?: TransactionType;
    fundId?: string;
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
    };

    // Add date range filtering if provided
    if (dateRange?.startDate || dateRange?.endDate) {
      where.date = {};

      if (dateRange.startDate) {
        // startDate is already a Date object from the DateRangeInput
        where.date.gte = dateRange.startDate;
      }

      if (dateRange.endDate) {
        // endDate is already a Date object from the DateRangeInput
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
  }): Promise<TransactionStats> {
    const { organisationId, branchId, dateRange, fundId, contributionTypeId } =
      params;
    if (!organisationId) {
      throw new Error(
        'organisationId is required for calculateTransactionStats',
      );
    }
    const where: any = { organisationId };
    if (branchId) where.branchId = branchId;
    if (fundId) where.fundId = fundId;

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
