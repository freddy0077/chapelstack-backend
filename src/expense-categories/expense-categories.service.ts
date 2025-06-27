import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateExpenseCategoryInput } from './dto/create-expense-category.input';
import { UpdateExpenseCategoryInput } from './dto/update-expense-category.input';
import { Prisma } from '@prisma/client';

@Injectable()
export class ExpenseCategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  create(createExpenseCategoryInput: CreateExpenseCategoryInput) {
    const { branchId, organisationId, ...rest } = createExpenseCategoryInput;
    const data: Prisma.ExpenseCategoryCreateInput = { ...rest };

    if (branchId) {
      data.branch = { connect: { id: branchId } };
    }

    if (organisationId) {
      data.organisation = { connect: { id: organisationId } };
    }

    return this.prisma.expenseCategory.create({ data });
  }

  findAll(organisationId?: string) {
    return this.prisma.expenseCategory.findMany({
      where: { organisationId },
    });
  }

  findOne(id: string) {
    return this.prisma.expenseCategory.findUnique({ where: { id } });
  }

  update(id: string, updateExpenseCategoryInput: UpdateExpenseCategoryInput) {
    const { id: _, branchId, organisationId, ...rest } = updateExpenseCategoryInput;
    const data: Prisma.ExpenseCategoryUpdateInput = { ...rest };

    if (branchId) {
      data.branch = { connect: { id: branchId } };
    }

    if (organisationId) {
      data.organisation = { connect: { id: organisationId } };
    }

    return this.prisma.expenseCategory.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.expenseCategory.delete({ where: { id } });
  }
}
