import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBudgetInput } from './dto/create-budget.input';
import { UpdateBudgetInput } from './dto/update-budget.input';
import { CreateBudgetItemInput } from './dto/create-budget-item.input';
import { UpdateBudgetItemInput } from './dto/update-budget-item.input';
import { Prisma } from '@prisma/client';

@Injectable()
export class BudgetService {
  constructor(private prisma: PrismaService) {}

  // ==================== BUDGET CRUD ====================

  async createBudget(input: CreateBudgetInput) {
    const {
      name,
      description,
      fiscalYear,
      startDate,
      endDate,
      totalAmount,
      fundId,
      ministryId,
      branchId,
      organisationId,
      createdById,
      budgetItems = [],
    } = input;

    // Calculate total amount from budget items if not provided
    const calculatedTotalAmount =
      budgetItems.length > 0
        ? budgetItems.reduce((sum, item) => sum + item.amount, 0)
        : totalAmount || 0;

    return this.prisma.budget.create({
      data: {
        name,
        description,
        fiscalYear,
        startDate,
        endDate,
        totalAmount: calculatedTotalAmount,
        status: 'ACTIVE',
        fundId,
        ministryId,
        branchId,
        organisationId,
        createdById,
        budgetItems: {
          create: budgetItems.map((item) => ({
            name: item.name,
            description: item.description,
            amount: item.amount,
            expenseCategoryId: item.expenseCategoryId,
          })),
        },
      },
      include: {
        budgetItems: {
          include: {
            expenseCategory: true,
          },
        },
        fund: true,
        ministry: true,
        branch: true,
        organisation: true,
      },
    });
  }

  async getBudgets(
    organisationId: string,
    branchId?: string,
    fundId?: string,
    fiscalYear?: number,
    status?: string,
  ) {
    const where: Prisma.BudgetWhereInput = {
      organisationId,
      ...(branchId && { branchId }),
      ...(fundId && { fundId }),
      ...(fiscalYear && { fiscalYear }),
      ...(status && { status }),
    };

    return this.prisma.budget.findMany({
      where,
      include: {
        budgetItems: {
          include: {
            expenseCategory: true,
          },
        },
        fund: true,
        ministry: true,
        branch: true,
        organisation: true,
      },
      orderBy: [{ fiscalYear: 'desc' }, { startDate: 'desc' }],
    });
  }

  async getBudgetById(id: string) {
    return this.prisma.budget.findUnique({
      where: { id },
      include: {
        budgetItems: {
          include: {
            expenseCategory: true,
          },
        },
        fund: true,
        ministry: true,
        branch: true,
        organisation: true,
      },
    });
  }

  async updateBudget(id: string, input: UpdateBudgetInput) {
    const {
      name,
      description,
      fiscalYear,
      startDate,
      endDate,
      totalAmount,
      status,
      notes,
      fundId,
      ministryId,
      updatedById,
    } = input;

    return this.prisma.budget.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(fiscalYear && { fiscalYear }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        ...(totalAmount !== undefined && { totalAmount }),
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
        ...(fundId && { fundId }),
        ...(ministryId && { ministryId }),
        ...(updatedById && { updatedById }),
      },
      include: {
        budgetItems: {
          include: {
            expenseCategory: true,
          },
        },
        fund: true,
        ministry: true,
        branch: true,
        organisation: true,
      },
    });
  }

  async deleteBudget(id: string) {
    return this.prisma.budget.delete({
      where: { id },
    });
  }

  // ==================== BUDGET ITEM CRUD ====================

  async createBudgetItem(input: CreateBudgetItemInput) {
    const { name, description, amount, budgetId, expenseCategoryId } = input;

    if (!budgetId) {
      throw new Error('budgetId is required for creating budget item');
    }

    const budgetItem = await this.prisma.budgetItem.create({
      data: {
        name,
        description,
        amount,
        budgetId,
        ...(expenseCategoryId && { expenseCategoryId }),
      },
      include: {
        expenseCategory: true,
        budget: true,
      },
    });

    // Update budget total amount
    await this.updateBudgetTotalAmount(budgetId);

    return budgetItem;
  }

  async updateBudgetItem(id: string, input: UpdateBudgetItemInput) {
    const { name, description, amount, expenseCategoryId } = input;

    const budgetItem = await this.prisma.budgetItem.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(amount !== undefined && { amount }),
        ...(expenseCategoryId && { expenseCategoryId }),
      },
      include: {
        expenseCategory: true,
        budget: true,
      },
    });

    // Update budget total amount
    await this.updateBudgetTotalAmount(budgetItem.budgetId);

    return budgetItem;
  }

  async deleteBudgetItem(id: string) {
    const budgetItem = await this.prisma.budgetItem.findUnique({
      where: { id },
    });

    if (!budgetItem) {
      throw new Error('Budget item not found');
    }

    await this.prisma.budgetItem.delete({
      where: { id },
    });

    // Update budget total amount
    await this.updateBudgetTotalAmount(budgetItem.budgetId);

    return { success: true };
  }

  // ==================== HELPER METHODS ====================

  private async updateBudgetTotalAmount(budgetId: string) {
    const budgetItems = await this.prisma.budgetItem.findMany({
      where: { budgetId },
    });

    const totalAmount = budgetItems.reduce((sum, item) => sum + item.amount, 0);

    await this.prisma.budget.update({
      where: { id: budgetId },
      data: { totalAmount },
    });
  }

  async getBudgetStats(organisationId: string, branchId?: string) {
    const where: Prisma.BudgetWhereInput = {
      organisationId,
      ...(branchId && { branchId }),
    };

    const [totalBudgets, activeBudgets, totalBudgetAmount, currentYearBudgets] =
      await Promise.all([
        this.prisma.budget.count({ where }),
        this.prisma.budget.count({ where: { ...where, status: 'ACTIVE' } }),
        this.prisma.budget.aggregate({
          where: { ...where, status: 'ACTIVE' },
          _sum: { totalAmount: true },
        }),
        this.prisma.budget.count({
          where: { ...where, fiscalYear: new Date().getFullYear() },
        }),
      ]);

    return {
      totalBudgets,
      activeBudgets,
      totalBudgetAmount: totalBudgetAmount._sum.totalAmount || 0,
      currentYearBudgets,
    };
  }
}
