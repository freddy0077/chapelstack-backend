import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  AddMemberToGroupInput,
  GroupMemberFilterInput,
  GroupMemberRole,
  UpdateGroupMemberInput,
} from '../dto/group-member.input';
import { GroupMember } from '../entities/group-member.entity';

@Injectable()
export class GroupMembersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters?: GroupMemberFilterInput): Promise<GroupMember[]> {
    const where = filters
      ? {
          ...(filters.id && { id: filters.id }),

          ...(filters.memberId && { memberId: filters.memberId }),

          ...(filters.ministryId && { ministryId: filters.ministryId }),

          ...(filters.smallGroupId && { smallGroupId: filters.smallGroupId }),

          ...(filters.role && { role: filters.role }),

          ...(filters.status && { status: filters.status }),
        }
      : {};

    return this.prisma.groupMember.findMany({
      where,

      include: {
        member: true,
        ministry: true,
        smallGroup: true,
      },
    }) as unknown as GroupMember[];
  }

  async findOne(
    idOrFilter: string | Partial<GroupMemberFilterInput>,
  ): Promise<GroupMember> {
    let where: Record<string, unknown>;

    if (typeof idOrFilter === 'string') {
      where = { id: idOrFilter };
    } else {
      where = {
        ...(idOrFilter.id && { id: idOrFilter.id }),
        ...(idOrFilter.memberId && { memberId: idOrFilter.memberId }),
        ...(idOrFilter.ministryId && { ministryId: idOrFilter.ministryId }),
        ...(idOrFilter.smallGroupId && {
          smallGroupId: idOrFilter.smallGroupId,
        }),

        ...(idOrFilter.role && { role: idOrFilter.role }),
        ...(idOrFilter.status && { status: idOrFilter.status }),
      };
    }

    const groupMember = await this.prisma.groupMember.findFirst({
      where,
      include: {
        member: true,
        ministry: true,
        smallGroup: true,
      },
    });

    if (!groupMember) {
      if (typeof idOrFilter === 'string') {
        throw new NotFoundException(
          `Group Member with ID ${idOrFilter} not found`,
        );
      } else {
        throw new NotFoundException(
          `Group Member with specified criteria not found`,
        );
      }
    }

    // Convert Prisma result to GroupMember entity with proper null handling
    return groupMember as unknown as GroupMember;
  }

  async addMemberToGroup(input: AddMemberToGroupInput): Promise<GroupMember> {
    // Validate that at least one of ministryId or smallGroupId is provided
    if (!input.ministryId && !input.smallGroupId) {
      throw new BadRequestException(
        'Either ministryId or smallGroupId must be provided',
      );
    }

    // Check if the member exists
    const member = await this.prisma.member.findUnique({
      where: { id: input.memberId },
    });

    if (!member) {
      throw new NotFoundException(`Member with ID ${input.memberId} not found`);
    }

    // Check if ministry exists if provided
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

    // Check if small group exists if provided
    if (input.smallGroupId) {
      const smallGroup = await this.prisma.smallGroup.findUnique({
        where: { id: input.smallGroupId },
      });

      if (!smallGroup) {
        throw new NotFoundException(
          `Small Group with ID ${input.smallGroupId} not found`,
        );
      }

      // Check if the group is at capacity
      if (smallGroup.maximumCapacity) {
        const currentMemberCount = await this.prisma.groupMember.count({
          where: {
            smallGroupId: input.smallGroupId,
            status: 'ACTIVE',
          },
        });

        if (currentMemberCount >= smallGroup.maximumCapacity) {
          throw new BadRequestException(
            `Small Group has reached maximum capacity of ${smallGroup.maximumCapacity} members`,
          );
        }
      }
    }

    // Check if member is already in the group
    const existingMembership = await this.prisma.groupMember.findFirst({
      where: {
        memberId: input.memberId,
        ...(input.ministryId ? { ministryId: input.ministryId } : {}),
        ...(input.smallGroupId ? { smallGroupId: input.smallGroupId } : {}),
      },
    });

    if (existingMembership) {
      throw new BadRequestException('Member is already part of this group');
    }

    // Create the group membership
    const newGroupMember = await this.prisma.groupMember.create({
      data: {
        memberId: input.memberId,
        ministryId: input.ministryId,
        smallGroupId: input.smallGroupId,
        role: input.role,
        status: input.status,
      },
      include: {
        member: true,
        ministry: true,
        smallGroup: true,
      },
    });

    // Convert Prisma result to GroupMember entity with proper null handling
    return newGroupMember as unknown as GroupMember;
  }

  async updateGroupMember(
    id: string,
    input: UpdateGroupMemberInput,
  ): Promise<GroupMember> {
    const groupMember = await this.prisma.groupMember.findUnique({
      where: { id },
    });

    if (!groupMember) {
      throw new NotFoundException(`Group Member with ID ${id} not found`);
    }

    return this.prisma.groupMember.update({
      where: { id },
      data: input,
      include: {
        member: true,
        ministry: true,
        smallGroup: true,
      },
    }) as unknown as GroupMember;
  }

  async removeMemberFromGroup(id: string): Promise<boolean> {
    const groupMember = await this.prisma.groupMember.findUnique({
      where: { id },
    });

    if (!groupMember) {
      throw new NotFoundException(`Group Member with ID ${id} not found`);
    }

    await this.prisma.groupMember.delete({
      where: { id },
    });

    return true;
  }

  async assignGroupLeader(groupMemberId: string): Promise<GroupMember> {
    const groupMember = await this.prisma.groupMember.findUnique({
      where: { id: groupMemberId },
      include: {
        smallGroup: true,
        ministry: true,
      },
    });

    if (!groupMember) {
      throw new NotFoundException(
        `Group Member with ID ${groupMemberId} not found`,
      );
    }

    // Update the current group member to be a leader
    const leaderGroupMember = await this.prisma.groupMember.update({
      where: { id: groupMemberId },
      data: {
        role: GroupMemberRole.LEADER,
      },
      include: {
        member: true,
        ministry: true,
        smallGroup: true,
      },
    });

    // Convert Prisma result to GroupMember entity with proper null handling
    return leaderGroupMember as unknown as GroupMember;
  }

  async getMembersByMinistry(ministryId: string): Promise<GroupMember[]> {
    const ministryMembers = await this.prisma.groupMember.findMany({
      where: { ministryId },

      include: {
        member: true,
      },
    });

    // Convert Prisma result to GroupMember entity with proper null handling
    return ministryMembers as unknown as GroupMember[];
  }

  async getMembersBySmallGroup(smallGroupId: string): Promise<GroupMember[]> {
    const smallGroupMembers = await this.prisma.groupMember.findMany({
      where: { smallGroupId },

      include: {
        member: true,
      },
    });

    console.log(
      'Fetched smallGroupMembers in service:',
      JSON.stringify(smallGroupMembers, null, 2),
    );
    // Convert Prisma result to GroupMember entity with proper null handling
    return smallGroupMembers as unknown as GroupMember[];
  }
}
