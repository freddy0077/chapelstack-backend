import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateContributionInput } from './dto/create-contribution.input';
import { UpdateContributionInput } from './dto/update-contribution.input';
import { Prisma } from '@prisma/client';

@Injectable()
export class ContributionsService {
  constructor(private readonly prisma: PrismaService) {}

  create(createContributionInput: CreateContributionInput) {
    const {
      contributionTypeId,
      fundId,
      paymentMethodId,
      pledgeId,
      branchId,
      organisationId,
      memberId,
      ...rest
    } = createContributionInput;
    const data: Prisma.ContributionCreateInput = {
      ...rest,
      contributionType: { connect: { id: contributionTypeId } },
      fund: { connect: { id: fundId } },
      paymentMethod: { connect: { id: paymentMethodId } },
    };

    if (pledgeId) {
      data.pledge = { connect: { id: pledgeId } };
    }
    if (branchId) {
      data.branch = { connect: { id: branchId } };
    }
    if (organisationId) {
      data.organisation = { connect: { id: organisationId } };
    }
    if (memberId) {
      data.member = { connect: { id: memberId } };
    }

    return this.prisma.contribution.create({ data });
  }

  findAll(organisationId?: string) {
    return this.prisma.contribution.findMany({
      where: { organisationId },
    });
  }

  findOne(id: string) {
    return this.prisma.contribution.findUnique({ where: { id } });
  }

  update(id: string, updateContributionInput: UpdateContributionInput) {
    const {
      id: _,
      contributionTypeId,
      fundId,
      paymentMethodId,
      pledgeId,
      branchId,
      organisationId,
      memberId,
      ...rest
    } = updateContributionInput;
    const data: Prisma.ContributionUpdateInput = { ...rest };

    if (contributionTypeId) {
      data.contributionType = { connect: { id: contributionTypeId } };
    }
    if (fundId) {
      data.fund = { connect: { id: fundId } };
    }
    if (paymentMethodId) {
      data.paymentMethod = { connect: { id: paymentMethodId } };
    }
    if (pledgeId) {
      data.pledge = { connect: { id: pledgeId } };
    }
    if (branchId) {
      data.branch = { connect: { id: branchId } };
    }
    if (organisationId) {
      data.organisation = { connect: { id: organisationId } };
    }
    if (memberId) {
      data.member = { connect: { id: memberId } };
    }

    return this.prisma.contribution.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.contribution.delete({ where: { id } });
  }
}
