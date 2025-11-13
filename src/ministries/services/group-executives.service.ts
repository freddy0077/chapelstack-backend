import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateGroupExecutiveInput,
  UpdateGroupExecutiveInput,
  GroupExecutiveFilterInput,
} from '../dto/group-executive.input';
import { GroupExecutive } from '../entities/group-executive.entity';

@Injectable()
export class GroupExecutivesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters?: GroupExecutiveFilterInput): Promise<GroupExecutive[]> {
    const where: any = {};
    if (filters) {
      if (filters.id) where.id = filters.id;
      if (filters.role) where.role = filters.role;
      if (filters.status) where.status = filters.status;
      if (filters.memberId) where.memberId = filters.memberId;
      if (filters.ministryId) where.ministryId = filters.ministryId;
      if (filters.smallGroupId) where.smallGroupId = filters.smallGroupId;
    }

    return this.prisma.groupExecutive.findMany({
      where,
      include: {
        member: true,
        ministry: true,
        smallGroup: true,
      },
      orderBy: {
        appointedAt: 'desc',
      },
    }) as any;
  }

  async findOne(id: string): Promise<GroupExecutive> {
    const executive = await this.prisma.groupExecutive.findUnique({
      where: { id },
      include: {
        member: true,
        ministry: true,
        smallGroup: true,
      },
    });

    if (!executive) {
      throw new NotFoundException(`Group Executive with ID ${id} not found`);
    }

    return executive as any;
  }

  async create(input: CreateGroupExecutiveInput): Promise<GroupExecutive> {
    // Validate that either ministryId or smallGroupId is provided
    if (!input.ministryId && !input.smallGroupId) {
      throw new BadRequestException(
        'Either ministryId or smallGroupId must be provided',
      );
    }

    // Validate member exists
    const member = await this.prisma.member.findUnique({
      where: { id: input.memberId },
    });

    if (!member) {
      throw new NotFoundException(`Member with ID ${input.memberId} not found`);
    }

    // Validate ministry exists if provided
    if (input.ministryId) {
      const ministry = await this.prisma.ministry.findUnique({
        where: { id: input.ministryId },
      });

      if (!ministry) {
        throw new NotFoundException(
          `Ministry with ID ${input.ministryId} not found`,
        );
      }
    }

    // Validate small group exists if provided
    if (input.smallGroupId) {
      const smallGroup = await this.prisma.smallGroup.findUnique({
        where: { id: input.smallGroupId },
      });

      if (!smallGroup) {
        throw new NotFoundException(
          `Small Group with ID ${input.smallGroupId} not found`,
        );
      }
    }

    // Check if member is already an executive with the same role in the same group
    const existingExecutive = await this.prisma.groupExecutive.findFirst({
      where: {
        memberId: input.memberId,
        role: input.role,
        ministryId: input.ministryId,
        smallGroupId: input.smallGroupId,
        status: 'ACTIVE',
      },
    });

    if (existingExecutive) {
      throw new BadRequestException(
        `Member is already an active ${input.role} in this group`,
      );
    }

    // Create the executive
    const executive = await this.prisma.groupExecutive.create({
      data: {
        role: input.role,
        memberId: input.memberId,
        ministryId: input.ministryId,
        smallGroupId: input.smallGroupId,
        status: 'ACTIVE',
      },
      include: {
        member: true,
        ministry: true,
        smallGroup: true,
      },
    });

    // Auto-create GroupMember if doesn't exist (for small groups)
    if (input.smallGroupId) {
      const existingMembership = await this.prisma.groupMember.findFirst({
        where: {
          memberId: input.memberId,
          smallGroupId: input.smallGroupId,
          status: 'ACTIVE',
        },
      });

      if (!existingMembership) {
        await this.prisma.groupMember.create({
          data: {
            memberId: input.memberId,
            smallGroupId: input.smallGroupId,
            role: 'MEMBER', // Default role for auto-created members
            status: 'ACTIVE',
          },
        });
      }
    }

    // Auto-create GroupMember if doesn't exist (for ministries)
    if (input.ministryId) {
      const existingMembership = await this.prisma.groupMember.findFirst({
        where: {
          memberId: input.memberId,
          ministryId: input.ministryId,
          status: 'ACTIVE',
        },
      });

      if (!existingMembership) {
        await this.prisma.groupMember.create({
          data: {
            memberId: input.memberId,
            ministryId: input.ministryId,
            role: 'MEMBER', // Default role for auto-created members
            status: 'ACTIVE',
          },
        });
      }
    }

    return executive as any;
  }

  async update(
    id: string,
    input: UpdateGroupExecutiveInput,
  ): Promise<GroupExecutive> {
    const executive = await this.prisma.groupExecutive.findUnique({
      where: { id },
    });

    if (!executive) {
      throw new NotFoundException(`Group Executive with ID ${id} not found`);
    }

    return this.prisma.groupExecutive.update({
      where: { id },
      data: {
        ...(input.role !== undefined && { role: input.role }),
        ...(input.status !== undefined && { status: input.status }),
        ...(input.status === 'INACTIVE' && { removedAt: new Date() }),
      },
      include: {
        member: true,
        ministry: true,
        smallGroup: true,
      },
    }) as any;
  }

  async remove(id: string): Promise<boolean> {
    const executive = await this.prisma.groupExecutive.findUnique({
      where: { id },
    });

    if (!executive) {
      throw new NotFoundException(`Group Executive with ID ${id} not found`);
    }

    // Soft delete by setting status to INACTIVE
    await this.prisma.groupExecutive.update({
      where: { id },
      data: {
        status: 'INACTIVE',
        removedAt: new Date(),
      },
    });

    return true;
  }

  async getExecutivesBySmallGroup(
    smallGroupId: string,
  ): Promise<GroupExecutive[]> {
    return this.prisma.groupExecutive.findMany({
      where: {
        smallGroupId,
        status: 'ACTIVE',
      },
      include: {
        member: true,
      },
      orderBy: {
        appointedAt: 'asc',
      },
    }) as any;
  }

  async getExecutivesByMinistry(ministryId: string): Promise<GroupExecutive[]> {
    return this.prisma.groupExecutive.findMany({
      where: {
        ministryId,
        status: 'ACTIVE',
      },
      include: {
        member: true,
      },
      orderBy: {
        appointedAt: 'asc',
      },
    }) as any;
  }

  async getExecutivesByMember(memberId: string): Promise<GroupExecutive[]> {
    return this.prisma.groupExecutive.findMany({
      where: {
        memberId,
        status: 'ACTIVE',
      },
      include: {
        ministry: true,
        smallGroup: true,
      },
      orderBy: {
        appointedAt: 'desc',
      },
    }) as any;
  }
}
