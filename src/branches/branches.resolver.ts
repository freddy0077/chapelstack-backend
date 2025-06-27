import {
  Args,
  ID,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { ParseUUIDPipe } from '@nestjs/common';
import { BranchesService } from './branches.service';
import { Branch } from './entities/branch.entity';
import { BranchSetting } from './entities/branch-setting.entity';
import { CreateBranchInput } from './dto/create-branch.input';
import { UpdateBranchInput } from './dto/update-branch.input';
import { UpdateBranchSettingInput } from './dto/update-branch-setting.input';
import { PaginationInput } from '../common/dto/pagination.input';
import { BranchFilterInput } from './dto/branch-filter.input';
import { PaginatedBranches } from './dto/paginated-branches.output';
import { MembersService } from '../members/services/members.service';
import { MemberStatus } from '../members/entities/member.entity';
import { BranchStatistics } from './dto/branch-statistics.output';

@Resolver(() => Branch)
export class BranchesResolver {
  constructor(
    private readonly branchesService: BranchesService,
    private readonly membersService: MembersService, // Injected MembersService
  ) {}

  @Mutation(() => Branch, { name: 'createBranch' })
  async createBranch(
    @Args('createBranchInput') createBranchInput: CreateBranchInput,
  ): Promise<Branch> {
    return this.branchesService.create(createBranchInput);
  }

  @Query(() => PaginatedBranches, { name: 'branches' })
  findAll(
    @Args('paginationInput', { nullable: true })
    paginationInput?: PaginationInput,
    @Args('filterInput', { nullable: true }) filterInput?: BranchFilterInput,
  ): Promise<PaginatedBranches> {
    return this.branchesService.findAll(paginationInput || {}, filterInput);
  }

  @Query(() => Branch, { name: 'branch', nullable: true })
  findOne(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
  ): Promise<Branch | null> {
    return this.branchesService.findOne(id);
  }

  @Mutation(() => Branch, { name: 'updateBranch' })
  updateBranch(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
    @Args('updateBranchInput') updateBranchInput: UpdateBranchInput,
  ): Promise<Branch> {
    return this.branchesService.update(id, updateBranchInput);
  }

  @Mutation(() => Branch, { name: 'removeBranch' })
  removeBranch(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
  ): Promise<Branch> {
    return this.branchesService.remove(id);
  }

  @ResolveField('settings', () => [BranchSetting], { nullable: 'itemsAndList' })
  async getBranchSettings(@Parent() branch: Branch): Promise<BranchSetting[]> {
    return this.branchesService.findBranchSettings(branch.id);
  }

  @Mutation(() => BranchSetting, { name: 'updateBranchSetting' })
  async updateBranchSetting(
    @Args('branchId', { type: () => ID }, ParseUUIDPipe) branchId: string,
    @Args('updateSettingInput') updateSettingInput: UpdateBranchSettingInput,
  ): Promise<BranchSetting> {
    return this.branchesService.updateBranchSetting(
      branchId,
      updateSettingInput,
    );
  }

  @ResolveField('statistics', () => BranchStatistics)
  async getBranchStatistics(
    @Parent() branch: Branch,
  ): Promise<BranchStatistics> {
    const { id: branchId } = branch;

    // Helper function to get statistics for a given period
    const getStatsForPeriod = async (
      periodBranchId: string,
      periodStartDate: Date,
      periodEndDate: Date,
    ): Promise<Omit<BranchStatistics, 'lastMonth'>> => {
      const totalMembersPromise = this.membersService.count({
        branchId: periodBranchId,
      });
      const activeMembersPromise = this.membersService.count({
        branchId: periodBranchId,
        status: MemberStatus.ACTIVE,
      });
      const inactiveMembersPromise = this.membersService.count({
        branchId: periodBranchId,
        status: MemberStatus.INACTIVE,
      });
      // Assuming 'membershipDate' for new members
      const newMembersInPeriodPromise = this.membersService.count({
        branchId: periodBranchId,
        membershipDate: {
          gte: periodStartDate,
          lte: periodEndDate,
        },
      });

      const [totalMembers, activeMembers, inactiveMembers, newMembersInPeriod] =
        await Promise.all([
          totalMembersPromise,
          activeMembersPromise,
          inactiveMembersPromise,
          newMembersInPeriodPromise,
        ]);

      return {
        totalMembers,
        activeMembers,
        inactiveMembers,
        newMembersInPeriod,
      };
    };

    // Current month calculations
    const now = new Date();
    const currentMonthStartDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
    );
    const currentMonthEndDate = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );

    // Previous month calculations
    const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthStartDate = new Date(
      prevMonthDate.getFullYear(),
      prevMonthDate.getMonth(),
      1,
    );
    const prevMonthEndDate = new Date(
      prevMonthDate.getFullYear(),
      prevMonthDate.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );

    const currentMonthStatsPromise = getStatsForPeriod(
      branchId,
      currentMonthStartDate,
      currentMonthEndDate,
    );
    const lastMonthStatsPromise = getStatsForPeriod(
      branchId,
      prevMonthStartDate,
      prevMonthEndDate,
    );

    const [currentMonthStats, lastMonthStats] = await Promise.all([
      currentMonthStatsPromise,
      lastMonthStatsPromise,
    ]);

    return {
      ...currentMonthStats,
      lastMonth: lastMonthStats,
    };
  }
}
