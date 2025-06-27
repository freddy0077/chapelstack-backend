import { Injectable } from '@nestjs/common';
import { CreateExpenseInput } from './dto/create-expense.input';
import { UpdateExpenseInput } from './dto/update-expense.input';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ExpensesService {
  constructor(private readonly prisma: PrismaService) {}
  create(createExpenseInput: CreateExpenseInput) {
    const {
      expenseCategoryId,
      fundId,
      paymentMethodId,
      vendorId,
      budgetId,
      branchId,
      organisationId,
      ...rest
    } = createExpenseInput;
    const data: Prisma.ExpenseCreateInput = {
      ...rest,
      expenseCategory: { connect: { id: expenseCategoryId } },
      fund: { connect: { id: fundId } },
      paymentMethod: { connect: { id: paymentMethodId } },
    };

    if (vendorId) {
      data.vendor = { connect: { id: vendorId } };
    }
    if (budgetId) {
      data.budget = { connect: { id: budgetId } };
    }
    if (branchId) {
      data.branch = { connect: { id: branchId } };
    }
    if (organisationId) {
      data.organisation = { connect: { id: organisationId } };
    }

    return this.prisma.expense.create({ data });
  }

  findAll(organisationId?: string) {
    return this.prisma.expense.findMany({
      where: { organisationId },
    });
  }

  findOne(id: string) {
    return this.prisma.expense.findUnique({ where: { id } });
  }

  update(id: string, updateExpenseInput: UpdateExpenseInput) {
    const {
      id: _,
      expenseCategoryId,
      fundId,
      paymentMethodId,
      vendorId,
      budgetId,
      branchId,
      organisationId,
      ...rest
    } = updateExpenseInput;
    const data: Prisma.ExpenseUpdateInput = { ...rest };

    if (expenseCategoryId) {
      data.expenseCategory = { connect: { id: expenseCategoryId } };
    }
    if (fundId) {
      data.fund = { connect: { id: fundId } };
    }
    if (paymentMethodId) {
      data.paymentMethod = { connect: { id: paymentMethodId } };
    }
    if (vendorId) {
      data.vendor = { connect: { id: vendorId } };
    }
    if (budgetId) {
      data.budget = { connect: { id: budgetId } };
    }
    if (branchId) {
      data.branch = { connect: { id: branchId } };
    }
    if (organisationId) {
      data.organisation = { connect: { id: organisationId } };
    }

    return this.prisma.expense.update({
      where: { id },
      data,
    });
  }

  remove(id: string) {
    return this.prisma.expense.delete({ where: { id } });
  }
}
