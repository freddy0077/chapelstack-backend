import {
  Args,
  ID,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { SmallGroupsService } from '../services/small-groups.service';
import { SmallGroup } from '../entities/small-group.entity';
import {
  CreateSmallGroupInput,
  SmallGroupFilterInput,
  UpdateSmallGroupInput,
} from '../dto/small-group.input';
import { GroupMember } from '../entities/group-member.entity';
import { GroupMembersService } from '../services/group-members.service';
import { Ministry } from '../entities/ministry.entity';
import { MinistriesService } from '../services/ministries.service';

@Resolver(() => SmallGroup)
export class SmallGroupsResolver {
  constructor(
    private readonly smallGroupsService: SmallGroupsService,
    private readonly groupMembersService: GroupMembersService,
    private readonly ministriesService: MinistriesService,
  ) {}

  @Query(() => [SmallGroup])
  async smallGroups(
    @Args('filters', { nullable: true }) filters?: SmallGroupFilterInput,
  ): Promise<SmallGroup[]> {
    return this.smallGroupsService.findAll(filters);
  }

  @Query(() => SmallGroup)
  async smallGroup(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<SmallGroup> {
    return this.smallGroupsService.findOne(id);
  }

  @Mutation(() => SmallGroup)
  async createSmallGroup(
    @Args('input') input: CreateSmallGroupInput,
  ): Promise<SmallGroup> {
    return this.smallGroupsService.create(input);
  }

  @Mutation(() => SmallGroup)
  async updateSmallGroup(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateSmallGroupInput,
  ): Promise<SmallGroup> {
    return this.smallGroupsService.update(id, input);
  }

  @Mutation(() => Boolean)
  async deleteSmallGroup(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    return this.smallGroupsService.remove(id);
  }

  @ResolveField(() => [GroupMember])
  async members(@Parent() smallGroup: SmallGroup): Promise<GroupMember[]> {
    return this.groupMembersService.getMembersBySmallGroup(smallGroup.id);
  }

  @ResolveField(() => Ministry, { nullable: true })
  async ministry(@Parent() smallGroup: SmallGroup): Promise<Ministry | null> {
    if (!smallGroup.ministryId) return null;
    return this.ministriesService.findOne(smallGroup.ministryId);
  }
}
