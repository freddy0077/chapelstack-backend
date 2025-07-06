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
