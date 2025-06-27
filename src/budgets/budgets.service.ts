import { Injectable } from '@nestjs/common';
import { CreateBudgetInput } from './dto/create-budget.input';
import { UpdateBudgetInput } from './dto/update-budget.input';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class BudgetsService {
  constructor(private readonly prisma: PrismaService) {}
  create(createBudgetInput: CreateBudgetInput) {
    const { fundId, branchId, organisationId, ...rest } = createBudgetInput;
    const data: Prisma.BudgetCreateInput = {
      ...rest,
      fund: { connect: { id: fundId } },
    };

    if (branchId) {
      data.branch = { connect: { id: branchId } };
    }
    if (organisationId) {
      data.organisation = { connect: { id: organisationId } };
    }

    return this.prisma.budget.create({ data });
  }

  findAll(organisationId?: string) {
    return this.prisma.budget.findMany({
      where: { organisationId },
    });
  }

  findOne(id: string) {
    return this.prisma.budget.findUnique({ where: { id } });
  }

  update(id: string, updateBudgetInput: UpdateBudgetInput) {
    const {
      id: _,
      fundId,
      branchId,
      organisationId,
      ...rest
    } = updateBudgetInput;
    const data: Prisma.BudgetUpdateInput = { ...rest };

    if (fundId) {
      data.fund = { connect: { id: fundId } };
    }
    if (branchId) {
      data.branch = { connect: { id: branchId } };
    }
    if (organisationId) {
      data.organisation = { connect: { id: organisationId } };
    }

    return this.prisma.budget.update({
      where: { id },
      data,
    });
  }

  remove(id: string) {
    return this.prisma.budget.delete({ where: { id } });
  }
}
