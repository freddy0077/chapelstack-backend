import { Injectable } from '@nestjs/common';
import { CreateFundInput } from './dto/create-fund.input';
import { UpdateFundInput } from './dto/update-fund.input';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class FundsService {
  constructor(private readonly prisma: PrismaService) {}

  create(createFundInput: CreateFundInput) {
    const { branchId, organisationId, ...rest } = createFundInput;
    const data: Prisma.FundCreateInput = { ...rest };

    if (branchId) {
      data.branch = { connect: { id: branchId } };
    }

    if (organisationId) {
      data.organisation = { connect: { id: organisationId } };
    }

    return this.prisma.fund.create({ data });
  }

  findAll(organisationId: string, branchId?: string) {
    const where: any = { organisationId };
    if (branchId) {
      where.branchId = branchId;
    }
    return this.prisma.fund.findMany({ where });
  }

  findOne(id: string) {
    return this.prisma.fund.findUnique({ where: { id } });
  }

  async calculateFundBalance(
    organisationId: string,
    fundId: string,
  ): Promise<number> {
    // Calculate fund balance based on transactions
    const transactions = await this.prisma.transaction.findMany({
      where: {
        organisationId,
        fundId,
      },
    });

    // Calculate balance: sum of income transactions minus sum of expense transactions
    let balance = 0;
    for (const transaction of transactions) {
      const amount =
        typeof transaction.amount === 'object' && transaction.amount !== null
          ? (transaction.amount as any).toNumber()
          : Number(transaction.amount);

      if (transaction.type === 'CONTRIBUTION') {
        // Contributions are income
        balance += amount;
      } else if (transaction.type === 'EXPENSE') {
        // Expenses reduce the balance
        balance -= amount;
      } else if (transaction.type === 'TRANSFER') {
        // For transfers, we need to check if this fund is receiving or sending
        // For now, we'll treat transfers as neutral (could be enhanced later)
        // This would require additional metadata to determine direction
      } else if (transaction.type === 'FUND_ALLOCATION') {
        // Fund allocations are typically income to the fund
        balance += amount;
      }
    }

    return balance;
  }

  update(id: string, updateFundInput: UpdateFundInput) {
    const { id: _, branchId, organisationId, ...rest } = updateFundInput;
    const data: Prisma.FundUpdateInput = { ...rest };

    if (branchId) {
      data.branch = { connect: { id: branchId } };
    }

    if (organisationId) {
      data.organisation = { connect: { id: organisationId } };
    }

    return this.prisma.fund.update({
      where: { id },
      data,
    });
  }

  remove(id: string) {
    return this.prisma.fund.delete({ where: { id } });
  }
}
