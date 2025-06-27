import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePrayerRequestInput } from './dto/create-prayer-request.input';
import { UpdatePrayerRequestInput } from './dto/update-prayer-request.input';

@Injectable()
export class PrayerRequestsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreatePrayerRequestInput) {
    return this.prisma.prayerRequest.create({
      data,
      include: {
        member: true,
      },
    });
  }

  async findAll({
    branchId,
    status,
    organisationId,
  }: {
    branchId?: string;
    status?: any;
    organisationId?: string;
  }) {
    // Prefer branchId if both are present
    const where: any = { status };
    if (branchId) {
      where.branchId = branchId;
    } else if (organisationId) {
      where.organisationId = organisationId;
    }
    return this.prisma.prayerRequest.findMany({
      where,
      include: {
        member: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const req = await this.prisma.prayerRequest.findUnique({
      where: { id },
      include: { member: true },
    });
    if (!req) throw new NotFoundException('Prayer request not found');
    return req;
  }

  async update(id: string, data: UpdatePrayerRequestInput) {
    return this.prisma.prayerRequest.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.prayerRequest.delete({ where: { id } });
  }
}
