import { Injectable } from '@nestjs/common';
import { CreatePledgeInput } from './dto/create-pledge.input';
import { UpdatePledgeInput } from './dto/update-pledge.input';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class PledgesService {
  constructor(private readonly prisma: PrismaService) {}
  create(createPledgeInput: CreatePledgeInput) {
    const { fundId, memberId, branchId, organisationId, ...rest } =
      createPledgeInput;
    const data: Prisma.PledgeCreateInput = {
      ...rest,
      fund: { connect: { id: fundId } },
      member: { connect: { id: memberId } },
    };

    if (branchId) {
      data.branch = { connect: { id: branchId } };
    }
    if (organisationId) {
      data.organisation = { connect: { id: organisationId } };
    }

    return this.prisma.pledge.create({ data });
  }

  findAll(organisationId?: string) {
    return this.prisma.pledge.findMany({
      where: { organisationId },
    });
  }

  findOne(id: string) {
    return this.prisma.pledge.findUnique({ where: { id } });
  }

  update(id: string, updatePledgeInput: UpdatePledgeInput) {
    const {
      id: _,
      fundId,
      memberId,
      branchId,
      organisationId,
      ...rest
    } = updatePledgeInput;
    const data: Prisma.PledgeUpdateInput = { ...rest };

    if (fundId) {
      data.fund = { connect: { id: fundId } };
    }
    if (memberId) {
      data.member = { connect: { id: memberId } };
    }
    if (branchId) {
      data.branch = { connect: { id: branchId } };
    }
    if (organisationId) {
      data.organisation = { connect: { id: organisationId } };
    }

    return this.prisma.pledge.update({
      where: { id },
      data,
    });
  }

  remove(id: string) {
    return this.prisma.pledge.delete({ where: { id } });
  }
}
