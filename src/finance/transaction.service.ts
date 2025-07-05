import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionInput } from './dto/create-transaction.input';
import { UpdateTransactionInput } from './dto/update-transaction.input';
import { TransactionType } from '@prisma/client';

@Injectable()
export class TransactionService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateTransactionInput) {
    console.log('gddgedggded', data);
    // Defensive: ensure type is a valid TransactionType enum value
    if (!data.type || !Object.values(TransactionType).includes(data.type)) {
      throw new Error(`Invalid or missing transaction type: ${data.type}`);
    }
    return this.prisma.transaction.create({
      data: {
        ...data,
        // Defensive: ensure type is cast to TransactionType (enum)
        type: data.type,
      },
    });
  }

  findAll(params?: {
    organisationId?: string;
    type?: TransactionType;
    fundId?: string;
  }) {
    return this.prisma.transaction.findMany({
      where: {
        ...(params?.organisationId && {
          organisationId: params.organisationId,
        }),
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
