import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import {
  CreateMinistryInput,
  MinistryFilterInput,
  UpdateMinistryInput,
} from '../dto/ministry.input';
import { Ministry } from '../entities/ministry.entity';

@Injectable()
export class MinistriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters?: MinistryFilterInput): Promise<Ministry[]> {
    const where = filters
      ? {
          ...(filters.id && { id: filters.id }),
          ...(filters.name && {
            name: {
              contains: filters.name,
              mode: Prisma.QueryMode.insensitive,
            },
          }),
          ...(filters.type && { type: filters.type }),
          ...(filters.status && { status: filters.status }),
          ...(filters.branchId && { branchId: filters.branchId }),
          ...(filters.parentId && { parentId: filters.parentId }),
          ...(filters.organisationId && { organisationId: filters.organisationId }),
        }
      : {};

    return this.prisma.ministry.findMany({
      where,
      include: {
        subMinistries: true,
        members: true,
        smallGroups: true,
      },
    });
  }

  async findOne(id: string): Promise<Ministry> {
    const ministry = await this.prisma.ministry.findUnique({
      where: { id },
      include: {
        subMinistries: true,
        members: true,
        smallGroups: true,
      },
    });

    if (!ministry) {
      throw new NotFoundException(`Ministry with ID ${id} not found`);
    }

    return ministry;
  }

  async create(input: CreateMinistryInput): Promise<Ministry> {
    return this.prisma.ministry.create({
      data: {
        name: input.name,
        description: input.description,
        type: input.type,
        status: input.status,
        branchId: input.branchId,
        parentId: input.parentId,
      },
      include: {
        subMinistries: true,
        members: true,
        smallGroups: true,
      },
    });
  }

  async update(id: string, input: UpdateMinistryInput): Promise<Ministry> {
    const ministry = await this.prisma.ministry.findUnique({
      where: { id },
    });

    if (!ministry) {
      throw new NotFoundException(`Ministry with ID ${id} not found`);
    }

    return this.prisma.ministry.update({
      where: { id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.description !== undefined && {
          description: input.description,
        }),
        ...(input.type !== undefined && { type: input.type }),
        ...(input.status !== undefined && { status: input.status }),
        ...(input.branchId !== undefined && { branchId: input.branchId }),
        ...(input.parentId !== undefined && { parentId: input.parentId }),
      },
      include: {
        subMinistries: true,
        members: true,
        smallGroups: true,
      },
    });
  }

  async remove(id: string): Promise<boolean> {
    const ministry = await this.prisma.ministry.findUnique({
      where: { id },
    });

    if (!ministry) {
      throw new NotFoundException(`Ministry with ID ${id} not found`);
    }

    await this.prisma.ministry.delete({
      where: { id },
    });

    return true;
  }

  async getSubMinistries(ministryId: string): Promise<Ministry[]> {
    return this.prisma.ministry.findMany({
      where: { parentId: ministryId },
    });
  }

  async getParentMinistry(ministryId: string): Promise<Ministry | null> {
    const ministry = await this.prisma.ministry.findUnique({
      where: { id: ministryId },
      include: { parent: true },
    });

    return ministry?.parent || null;
  }
}
