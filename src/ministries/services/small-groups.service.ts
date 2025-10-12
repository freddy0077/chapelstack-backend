import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateSmallGroupInput,
  SmallGroupFilterInput,
  UpdateSmallGroupInput,
} from '../dto/small-group.input';
import { SmallGroup } from '../entities/small-group.entity';

@Injectable()
export class SmallGroupsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters?: SmallGroupFilterInput): Promise<SmallGroup[]> {
    const where: any = {};
    if (filters) {
      if (filters.id) where.id = filters.id;
      if (filters.name)
        where.name = { contains: filters.name, mode: 'insensitive' };
      if (filters.type) where.type = filters.type;
      if (filters.status) where.status = filters.status;
      if (filters.branchId) where.branchId = filters.branchId;
      if (filters.organisationId) where.organisationId = filters.organisationId;
      if (filters.ministryId) where.ministryId = filters.ministryId;
      if (filters.search) {
        where.OR = [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
        ];
      }
    }

    return this.prisma.smallGroup.findMany({
      where,
      include: {
        members: true,
        ministry: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string): Promise<SmallGroup> {
    const smallGroup = await this.prisma.smallGroup.findUnique({
      where: { id },
      include: {
        members: true,
        ministry: true,
      },
    });

    if (!smallGroup) {
      throw new NotFoundException(`Small Group with ID ${id} not found`);
    }

    return smallGroup;
  }

  async create(input: CreateSmallGroupInput): Promise<SmallGroup> {
    // If the group has a ministry, check if it exists
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

    return this.prisma.smallGroup.create({
      data: {
        name: input.name,
        description: input.description,
        type: input.type,
        meetingSchedule: input.meetingSchedule,
        location: input.location,
        maximumCapacity: input.maximumCapacity,
        status: input.status,
        branchId: input.branchId,
        ministryId: input.ministryId,
        organisationId: input.organisationId,
      },
      include: {
        members: true,
        ministry: true,
      },
    });
  }

  async update(id: string, input: UpdateSmallGroupInput): Promise<SmallGroup> {
    const smallGroup = await this.prisma.smallGroup.findUnique({
      where: { id },
    });

    if (!smallGroup) {
      throw new NotFoundException(`Small Group with ID ${id} not found`);
    }

    // If changing the ministry, check if it exists
    if (input.ministryId && input.ministryId !== smallGroup.ministryId) {
      const ministry = await this.prisma.ministry.findUnique({
        where: { id: input.ministryId },
      });

      if (!ministry) {
        throw new NotFoundException(
          `Ministry with ID ${input.ministryId} not found`,
        );
      }
    }

    return this.prisma.smallGroup.update({
      where: { id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.description !== undefined && {
          description: input.description,
        }),
        ...(input.type !== undefined && { type: input.type }),
        ...(input.meetingSchedule !== undefined && {
          meetingSchedule: input.meetingSchedule,
        }),
        ...(input.location !== undefined && { location: input.location }),
        ...(input.maximumCapacity !== undefined && {
          maximumCapacity: input.maximumCapacity,
        }),
        ...(input.status !== undefined && { status: input.status }),
        ...(input.branchId !== undefined && { branchId: input.branchId }),
        ...(input.ministryId !== undefined && { ministryId: input.ministryId }),
      },
      include: {
        members: true,
        ministry: true,
      },
    });
  }

  async remove(id: string): Promise<boolean> {
    const smallGroup = await this.prisma.smallGroup.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            member: true,
          },
        },
      },
    });

    if (!smallGroup) {
      throw new NotFoundException(`Small Group with ID ${id} not found`);
    }

    // Update all active group members to inactive with leave date
    await this.prisma.groupMember.updateMany({
      where: {
        smallGroupId: id,
        status: 'ACTIVE',
      },
      data: {
        status: 'INACTIVE',
        leaveDate: new Date(),
        leaveReason: `Group "${smallGroup.name}" was deactivated`,
      },
    });

    // Create audit log entries for each member
    for (const groupMember of smallGroup.members) {
      if (groupMember.status === 'ACTIVE') {
        const memberName = `${groupMember.member?.firstName || ''} ${groupMember.member?.lastName || ''}`.trim();
        
        await this.prisma.auditLog.create({
          data: {
            entityType: 'GroupMember',
            entityId: groupMember.id,
            action: 'UPDATE',
            description: `${memberName} removed from ${smallGroup.name} (group deactivated)`,
            metadata: {
              memberId: groupMember.memberId,
              memberName,
              groupId: id,
              groupName: smallGroup.name,
              groupType: 'SmallGroup',
              role: groupMember.role,
              leaveDate: new Date(),
              leaveReason: `Group "${smallGroup.name}" was deactivated`,
              reason: 'GROUP_DEACTIVATED',
            },
          },
        });
      }
    }

    // Now delete the group
    await this.prisma.smallGroup.delete({
      where: { id },
    });

    return true;
  }

  async getGroupsByMinistry(ministryId: string): Promise<SmallGroup[]> {
    return this.prisma.smallGroup.findMany({
      where: { ministryId },
      include: {
        members: true,
      },
    });
  }
}
