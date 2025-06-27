import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Child } from '../entities/child.entity';
import { CreateChildInput } from '../dto/create-child.input';
import { UpdateChildInput } from '../dto/update-child.input';
import { ChildFilterInput } from '../dto/child-filter.input';
import { Prisma } from '@prisma/client';

@Injectable()
export class ChildrenService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createChildInput: CreateChildInput): Promise<Child> {
    return this.prisma.child.create({
      data: {
        ...createChildInput,
      },
    });
  }

  async findAll(filter?: ChildFilterInput): Promise<Child[]> {
    const where: Prisma.ChildWhereInput = {};

    if (filter) {
      if (filter.firstName) {
        where.firstName = { contains: filter.firstName, mode: 'insensitive' };
      }
      if (filter.lastName) {
        where.lastName = { contains: filter.lastName, mode: 'insensitive' };
      }
      if (filter.gender) {
        where.gender = filter.gender;
      }
      if (filter.branchId) {
        where.branchId = filter.branchId;
      }
      if (filter.dateOfBirthFrom || filter.dateOfBirthTo) {
        where.dateOfBirth = {};
        if (filter.dateOfBirthFrom) {
          where.dateOfBirth.gte = filter.dateOfBirthFrom;
        }
        if (filter.dateOfBirthTo) {
          where.dateOfBirth.lte = filter.dateOfBirthTo;
        }
      }
    }

    return this.prisma.child.findMany({
      where,
      orderBy: { lastName: 'asc' },
    });
  }

  async findOne(id: string): Promise<Child> {
    const child = await this.prisma.child.findUnique({
      where: { id },
      include: {
        guardianRelations: {
          include: {
            guardian: true,
          },
        },
      },
    });

    if (!child) {
      throw new NotFoundException(`Child with ID ${id} not found`);
    }

    return child;
  }

  async update(id: string, updateChildInput: UpdateChildInput): Promise<Child> {
    // First check if the child exists
    await this.findOne(id);

    return this.prisma.child.update({
      where: { id },
      data: {
        ...updateChildInput,
      },
    });
  }

  async remove(id: string): Promise<Child> {
    // First check if the child exists
    await this.findOne(id);

    return this.prisma.child.delete({
      where: { id },
    });
  }

  async findByGuardian(guardianId: string): Promise<Child[]> {
    return this.prisma.child.findMany({
      where: {
        guardianRelations: {
          some: {
            guardianId,
          },
        },
      },
      orderBy: { lastName: 'asc' },
    });
  }

  async getRecentCheckIns(childId: string, limit = 5): Promise<any[]> {
    return this.prisma.checkInRecord.findMany({
      where: { childId },
      orderBy: { checkedInAt: 'desc' },
      take: limit,
      include: {
        event: true,
        checkedInBy: true,
        checkedOutBy: true,
      },
    });
  }
}
