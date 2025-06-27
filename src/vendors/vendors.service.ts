import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateVendorInput } from './dto/create-vendor.input';
import { UpdateVendorInput } from './dto/update-vendor.input';
import { Prisma } from '@prisma/client';

@Injectable()
export class VendorsService {
  constructor(private readonly prisma: PrismaService) {}

  create(createVendorInput: CreateVendorInput) {
    const { branchId, organisationId, ...rest } = createVendorInput;
    const data: Prisma.VendorCreateInput = { ...rest };

    if (branchId) {
      data.branch = { connect: { id: branchId } };
    }

    if (organisationId) {
      data.organisation = { connect: { id: organisationId } };
    }

    return this.prisma.vendor.create({ data });
  }

  findAll(organisationId?: string) {
    return this.prisma.vendor.findMany({
      where: { organisationId },
    });
  }

  findOne(id: string) {
    return this.prisma.vendor.findUnique({ where: { id } });
  }

  update(id: string, updateVendorInput: UpdateVendorInput) {
    const { branchId, organisationId, ...rest } = updateVendorInput;
    const data: Prisma.VendorUpdateInput = { ...rest };

    if (branchId) {
      data.branch = { connect: { id: branchId } };
    }

    if (organisationId) {
      data.organisation = { connect: { id: organisationId } };
    }
    return this.prisma.vendor.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.vendor.delete({ where: { id } });
  }
}
