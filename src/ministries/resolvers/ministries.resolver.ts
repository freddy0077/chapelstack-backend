import {
  Args,
  ID,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { MinistriesService } from '../services/ministries.service';
import { Ministry } from '../entities/ministry.entity';
import {
  CreateMinistryInput,
  MinistryFilterInput,
  UpdateMinistryInput,
} from '../dto/ministry.input';
import { SmallGroup } from '../entities/small-group.entity';
import { SmallGroupsService } from '../services/small-groups.service';
import { GroupMember } from '../entities/group-member.entity';
import { GroupMembersService } from '../services/group-members.service';

@Resolver(() => Ministry)
export class MinistriesResolver {
  constructor(
    private readonly ministriesService: MinistriesService,
    private readonly smallGroupsService: SmallGroupsService,
    private readonly groupMembersService: GroupMembersService,
  ) {}

  @Query(() => [Ministry])
  async ministries(
    @Args('filters', { nullable: true }) filters?: MinistryFilterInput,
  ): Promise<Ministry[]> {
    return this.ministriesService.findAll(filters);
  }

  @Query(() => Ministry)
  async ministry(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Ministry> {
    return this.ministriesService.findOne(id);
  }

  @Mutation(() => Ministry)
  async createMinistry(
    @Args('input') input: CreateMinistryInput,
  ): Promise<Ministry> {
    return this.ministriesService.create(input);
  }

  @Mutation(() => Ministry)
  async updateMinistry(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateMinistryInput,
  ): Promise<Ministry> {
    return this.ministriesService.update(id, input);
  }

  @Mutation(() => Boolean)
  async deleteMinistry(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    return this.ministriesService.remove(id);
  }

  @ResolveField(() => [SmallGroup])
  async smallGroups(@Parent() ministry: Ministry): Promise<SmallGroup[]> {
    return this.smallGroupsService.getGroupsByMinistry(ministry.id);
  }

  @ResolveField(() => [GroupMember])
  async members(@Parent() ministry: Ministry): Promise<GroupMember[]> {
    return this.groupMembersService.getMembersByMinistry(ministry.id);
  }

  @ResolveField(() => [Ministry])
  async subMinistries(@Parent() ministry: Ministry): Promise<Ministry[]> {
    return this.ministriesService.getSubMinistries(ministry.id);
  }

  @ResolveField(() => Ministry, { nullable: true })
  async parent(@Parent() ministry: Ministry): Promise<Ministry | null> {
    if (!ministry.parentId) return null;
    return this.ministriesService.getParentMinistry(ministry.id);
  }
}
