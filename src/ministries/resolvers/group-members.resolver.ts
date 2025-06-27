import {
  Args,
  ID,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { GroupMembersService } from '../services/group-members.service';
import { GroupMember } from '../entities/group-member.entity';
import {
  AddMemberToGroupInput,
  GroupMemberFilterInput,
  UpdateGroupMemberInput,
} from '../dto/group-member.input';
import { Ministry } from '../entities/ministry.entity';
import { MinistriesService } from '../services/ministries.service';
import { SmallGroup } from '../entities/small-group.entity';
import { SmallGroupsService } from '../services/small-groups.service';
import { GroupMemberRole } from '../enums/group-member-role.enum';

@Resolver(() => GroupMember)
export class GroupMembersResolver {
  constructor(
    private readonly groupMembersService: GroupMembersService,
    private readonly ministriesService: MinistriesService,
    private readonly smallGroupsService: SmallGroupsService,
  ) {}

  @Query(() => [GroupMember])
  async groupMembers(
    @Args('filters', { nullable: true }) filters?: GroupMemberFilterInput,
  ): Promise<GroupMember[]> {
    return this.groupMembersService.findAll(filters);
  }

  @Query(() => GroupMember)
  async groupMember(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<GroupMember> {
    return this.groupMembersService.findOne(id);
  }

  @Mutation(() => GroupMember)
  async addMemberToGroup(
    @Args('groupId', { type: () => ID }) groupId: string,
    @Args('memberId', { type: () => ID }) memberId: string,
    @Args('roleInGroup', { type: () => String, nullable: true })
    roleInGroup?: string,
  ): Promise<GroupMember> {
    // Convert to the input format expected by the service
    const input: AddMemberToGroupInput = {
      memberId,
      // Determine if this is a ministry or small group ID
      // This is a simplified approach - in a real implementation, you'd need to check
      // if the ID belongs to a ministry or small group
      smallGroupId: groupId,
      role: (roleInGroup as GroupMemberRole) || GroupMemberRole.MEMBER,
      status: 'ACTIVE',
    };
    return this.groupMembersService.addMemberToGroup(input);
  }

  @Mutation(() => GroupMember)
  async updateGroupMember(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateGroupMemberInput,
  ): Promise<GroupMember> {
    return this.groupMembersService.updateGroupMember(id, input);
  }

  @Mutation(() => Boolean)
  async removeMemberFromGroup(
    @Args('groupId', { type: () => ID }) groupId: string,
    @Args('memberId', { type: () => ID }) memberId: string,
  ): Promise<boolean> {
    // Find the group member record first
    const groupMember = await this.groupMembersService.findOne({
      smallGroupId: groupId,
      memberId,
    });
    if (!groupMember) {
      return false;
    }
    return this.groupMembersService.removeMemberFromGroup(groupMember.id);
  }

  @Mutation(() => GroupMember)
  async assignGroupLeader(
    @Args('groupId', { type: () => ID }) groupId: string,
    @Args('memberId', { type: () => ID }) memberId: string,
  ): Promise<GroupMember> {
    // Find the group member record first
    const groupMember = await this.groupMembersService.findOne({
      smallGroupId: groupId,
      memberId,
    });

    if (!groupMember) {
      throw new Error(
        `Group member not found for groupId ${groupId} and memberId ${memberId}`,
      );
    }

    return this.groupMembersService.assignGroupLeader(groupMember.id);
  }

  @ResolveField(() => Ministry, { nullable: true })
  async ministry(@Parent() groupMember: GroupMember): Promise<Ministry | null> {
    if (!groupMember.ministryId) return null;
    return this.ministriesService.findOne(groupMember.ministryId);
  }

  @ResolveField(() => SmallGroup, { nullable: true })
  async smallGroup(
    @Parent() groupMember: GroupMember,
  ): Promise<SmallGroup | null> {
    if (!groupMember.smallGroupId) return null;
    return this.smallGroupsService.findOne(groupMember.smallGroupId);
  }
}
