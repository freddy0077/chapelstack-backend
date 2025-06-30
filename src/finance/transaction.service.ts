import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionInput } from './dto/create-transaction.input';
import { UpdateTransactionInput } from './dto/update-transaction.input';
import { TransactionType } from '@prisma/client';

@Injectable()
export class TransactionService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateTransactionInput) {
    return this.prisma.transaction.create({ data });
  }

  findAll(params?: { organisationId?: string; type?: TransactionType; fundId?: string; }) {
    return this.prisma.transaction.findMany({
      where: {
        ...(params?.organisationId && { organisationId: params.organisationId }),
        ...(params?.type && { type: params.type }),
        ...(params?.fundId && { fundId: params.fundId }),
      },
      orderBy: { date: 'desc' },
    });
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
