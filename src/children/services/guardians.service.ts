import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Guardian } from '../entities/guardian.entity';
import { CreateGuardianInput } from '../dto/create-guardian.input';
import { UpdateGuardianInput } from '../dto/update-guardian.input';
import { CreateChildGuardianRelationInput } from '../dto/create-child-guardian-relation.input';
import { ChildGuardianRelation } from '../entities/child-guardian-relation.entity';

@Injectable()
export class GuardiansService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createGuardianInput: CreateGuardianInput): Promise<Guardian> {
    return this.prisma.guardian.create({
      data: {
        ...createGuardianInput,
      },
    });
  }

  async findAll(branchId?: string): Promise<Guardian[]> {
    const where = branchId ? { branchId } : {};

    return this.prisma.guardian.findMany({
      where,
      orderBy: { lastName: 'asc' },
    });
  }

  async findOne(id: string): Promise<Guardian> {
    const guardian = await this.prisma.guardian.findUnique({
      where: { id },
      include: {
        childRelations: {
          include: {
            child: true,
          },
        },
      },
    });

    if (!guardian) {
      throw new NotFoundException(`Guardian with ID ${id} not found`);
    }

    return guardian;
  }

  async update(
    id: string,
    updateGuardianInput: UpdateGuardianInput,
  ): Promise<Guardian> {
    // First check if the guardian exists
    await this.findOne(id);

    return this.prisma.guardian.update({
      where: { id },
      data: {
        ...updateGuardianInput,
      },
    });
  }

  async remove(id: string): Promise<Guardian> {
    // First check if the guardian exists
    await this.findOne(id);

    return this.prisma.guardian.delete({
      where: { id },
    });
  }

  async findByChild(childId: string): Promise<Guardian[]> {
    return this.prisma.guardian.findMany({
      where: {
        childRelations: {
          some: {
            childId,
          },
        },
      },
      orderBy: [{ isPrimaryGuardian: 'desc' }, { lastName: 'asc' }],
    });
  }

  async findByMember(memberId: string): Promise<Guardian[]> {
    return this.prisma.guardian.findMany({
      where: { memberId },
    });
  }

  async createChildGuardianRelation(
    input: CreateChildGuardianRelationInput,
  ): Promise<ChildGuardianRelation> {
    // Check if the relation already exists
    const existingRelation = await this.prisma.childGuardianRelation.findFirst({
      where: {
        childId: input.childId,
        guardianId: input.guardianId,
      },
    });

    if (existingRelation) {
      return this.prisma.childGuardianRelation.update({
        where: { id: existingRelation.id },
        data: { relationship: input.relationship },
      });
    }

    return this.prisma.childGuardianRelation.create({
      data: input,
    });
  }

  async removeChildGuardianRelation(
    childId: string,
    guardianId: string,
  ): Promise<boolean> {
    const relation = await this.prisma.childGuardianRelation.findFirst({
      where: {
        childId,
        guardianId,
      },
    });

    if (!relation) {
      throw new NotFoundException(
        `Relation between child ${childId} and guardian ${guardianId} not found`,
      );
    }

    await this.prisma.childGuardianRelation.delete({
      where: { id: relation.id },
    });

    return true;
  }
}
