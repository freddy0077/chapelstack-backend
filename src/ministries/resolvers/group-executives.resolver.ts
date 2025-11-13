import {
  Args,
  ID,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { GroupExecutivesService } from '../services/group-executives.service';
import { GroupExecutive } from '../entities/group-executive.entity';
import {
  CreateGroupExecutiveInput,
  UpdateGroupExecutiveInput,
  GroupExecutiveFilterInput,
} from '../dto/group-executive.input';
import { Member } from '../../members/entities/member.entity';
import { MembersService } from '../../members/services/members.service';
import { Ministry } from '../entities/ministry.entity';
import { MinistriesService } from '../services/ministries.service';
import { SmallGroup } from '../entities/small-group.entity';
import { SmallGroupsService } from '../services/small-groups.service';

@Resolver(() => GroupExecutive)
export class GroupExecutivesResolver {
  constructor(
    private readonly groupExecutivesService: GroupExecutivesService,
    private readonly membersService: MembersService,
    private readonly ministriesService: MinistriesService,
    private readonly smallGroupsService: SmallGroupsService,
  ) {}

  @Query(() => [GroupExecutive])
  async groupExecutives(
    @Args('filters', { nullable: true }) filters?: GroupExecutiveFilterInput,
  ): Promise<GroupExecutive[]> {
    return this.groupExecutivesService.findAll(filters);
  }

  @Query(() => GroupExecutive)
  async groupExecutive(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<GroupExecutive> {
    return this.groupExecutivesService.findOne(id);
  }

  @Mutation(() => GroupExecutive)
  async createGroupExecutive(
    @Args('input') input: CreateGroupExecutiveInput,
  ): Promise<GroupExecutive> {
    return this.groupExecutivesService.create(input);
  }

  @Mutation(() => GroupExecutive)
  async updateGroupExecutive(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateGroupExecutiveInput,
  ): Promise<GroupExecutive> {
    return this.groupExecutivesService.update(id, input);
  }

  @Mutation(() => Boolean)
  async removeGroupExecutive(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    return this.groupExecutivesService.remove(id);
  }

  @ResolveField(() => Member)
  async member(@Parent() executive: GroupExecutive): Promise<Member> {
    return this.membersService.findOne(executive.memberId);
  }

  @ResolveField(() => Ministry, { nullable: true })
  async ministry(
    @Parent() executive: GroupExecutive,
  ): Promise<Ministry | null> {
    if (!executive.ministryId) return null;
    return this.ministriesService.findOne(executive.ministryId);
  }

  @ResolveField(() => SmallGroup, { nullable: true })
  async smallGroup(
    @Parent() executive: GroupExecutive,
  ): Promise<SmallGroup | null> {
    if (!executive.smallGroupId) return null;
    return this.smallGroupsService.findOne(executive.smallGroupId);
  }
}
