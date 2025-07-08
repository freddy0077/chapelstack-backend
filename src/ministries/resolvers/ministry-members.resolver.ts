import { Resolver, Mutation, Args, ID } from '@nestjs/graphql';
import { MinistryMembersService } from '../services/ministry-members.service';
import { AddMemberToMinistryInput } from '../dto/ministry-member.input';
import { MinistryMember } from '../entities/ministry-member.entity';
import { UsePipes, ValidationPipe } from '@nestjs/common';

@Resolver(() => MinistryMember)
export class MinistryMembersResolver {
  constructor(
    private readonly ministryMembersService: MinistryMembersService,
  ) {}

  @Mutation(() => MinistryMember)
  async addMemberToMinistry(
    @Args('ministryId', { type: () => ID }) ministryId: string,
    @Args('memberId', { type: () => ID }) memberId: string,
    @Args('role', { type: () => String, nullable: true }) role?: string,
    @Args('joinDate', { type: () => String, nullable: true }) joinDate?: string,
  ): Promise<MinistryMember> {
    const input: AddMemberToMinistryInput = {
      ministryId,
      memberId,
      role,
      joinDate,
    };
    return this.ministryMembersService.addMemberToMinistry(input);
  }
}
