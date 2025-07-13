import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionInput } from './dto/create-transaction.input';
import { UpdateTransactionInput } from './dto/update-transaction.input';
import { Prisma, TransactionType } from '@prisma/client';
import { DateRangeInput } from '../common/dto/date-range.input';
import { TransactionStats } from './dto/transaction-stats.dto';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { Parser as Json2CsvParser } from 'json2csv';
import * as ExcelJS from 'exceljs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TransactionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

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
      memberId,
      eventId,
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
        ...(memberId && { member: { connect: { id: memberId } } }),
        ...(eventId && { event: { connect: { id: eventId } } }),
      },
    });
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
    exportFormat: string;
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
        filter.date.gte = new Date(params.dateRange.startDate);
      if (params.dateRange.endDate)
        filter.date.lte = new Date(params.dateRange.endDate);
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
    switch (params.exportFormat.toLowerCase()) {
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
