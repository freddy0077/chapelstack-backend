import { Injectable } from '@nestjs/common';
import { AddMemberToMinistryInput } from '../dto/ministry-member.input';
import { MinistryMember } from '../entities/ministry-member.entity';
import { Ministry } from '../entities/ministry.entity';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MinistryMembersService {
  constructor(private readonly prisma: PrismaService) {}

  async addMemberToMinistry(
    input: AddMemberToMinistryInput,
  ): Promise<MinistryMember> {
    if (!input.memberId || !input.ministryId) {
      throw new Error(
        `Both memberId and ministryId are required. Received memberId: ${input.memberId}, ministryId: ${input.ministryId}`,
      );
    }

    const groupMember = await this.prisma.groupMember.create({
      data: {
        memberId: input.memberId,
        ministryId: input.ministryId,
        role: input.role || 'MEMBER',
        joinDate: input.joinDate ? new Date(input.joinDate) : new Date(),
        status: 'ACTIVE',
      },
      include: {
        ministry: true,
      },
    });
    return {
      id: groupMember.id,
      ministry: groupMember.ministry as Ministry,
      memberId: groupMember.memberId,
      role: groupMember.role,
      joinDate: groupMember.joinDate.toISOString(),
    };
  }
}
