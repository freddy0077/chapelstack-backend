import { Resolver, Query, Mutation, Args, Context, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { FollowUpReminderService } from '../services/follow-up-reminder.service';
import {
  CreateFollowUpReminderInput,
  UpdateFollowUpReminderInput,
  FollowUpReminderFilterInput,
  FollowUpReminder,
} from '../dto/follow-up-reminder.dto';
import { FollowUpStatus } from '@prisma/client';

@Resolver(() => FollowUpReminder)
@UseGuards(JwtAuthGuard, RolesGuard)
export class FollowUpReminderResolver {
  constructor(private followUpReminderService: FollowUpReminderService) {}

  @Mutation(() => FollowUpReminder)
  // @Roles('SUPER_ADMIN', 'BRANCH_ADMIN', 'PASTOR', 'STAFF')
  async createFollowUpReminder(
    @Args('input') input: CreateFollowUpReminderInput,
    @Context() context: any,
  ): Promise<FollowUpReminder> {
    const user = context.req.user;
    return this.followUpReminderService.createFollowUpReminder(
      input,
      user.id,
    ) as any;
  }

  @Mutation(() => FollowUpReminder)
  // @Roles('SUPER_ADMIN', 'BRANCH_ADMIN', 'PASTOR', 'STAFF')
  async updateFollowUpReminder(
    @Args('input') input: UpdateFollowUpReminderInput,
    @Context() context: any,
  ): Promise<FollowUpReminder> {
    const user = context.req.user;
    const organisationId = user.organisationId;
    const branchId = user.role === 'SUPER_ADMIN' ? undefined : user.branchId;

    return this.followUpReminderService.updateFollowUpReminder(
      input,
      user.id,
      organisationId,
      branchId,
    ) as any;
  }

  @Query(() => [FollowUpReminder])
  // @Roles('SUPER_ADMIN', 'BRANCH_ADMIN', 'PASTOR', 'STAFF')
  async followUpReminders(
    @Args('filter') filter: FollowUpReminderFilterInput,
    @Args('skip', { type: () => Int, defaultValue: 0 }) skip: number,
    @Args('take', { type: () => Int, defaultValue: 50 }) take: number,
    @Context() context: any,
  ): Promise<FollowUpReminder[]> {
    const user = context.req.user;

    // Ensure user can only access their organization/branch data
    const finalFilter = {
      ...filter,
      organisationId: user.organisationId,
      ...(user.role !== 'SUPER_ADMIN' && { branchId: user.branchId }),
    };

    const result = await this.followUpReminderService.getFollowUpReminders(
      finalFilter,
      skip,
      take,
    );
    return result.reminders as any;
  }

  @Query(() => Int)
  // @Roles('SUPER_ADMIN', 'BRANCH_ADMIN', 'PASTOR', 'STAFF')
  async followUpRemindersCount(
    @Args('filter') filter: FollowUpReminderFilterInput,
    @Context() context: any,
  ): Promise<number> {
    const user = context.req.user;

    // Ensure user can only access their organization/branch data
    const finalFilter = {
      ...filter,
      organisationId: user.organisationId,
      ...(user.role !== 'SUPER_ADMIN' && { branchId: user.branchId }),
    };

    const result = await this.followUpReminderService.getFollowUpReminders(
      finalFilter,
      0,
      1,
    );
    return result.total;
  }

  @Query(() => FollowUpReminder)
  // @Roles('SUPER_ADMIN', 'BRANCH_ADMIN', 'PASTOR', 'STAFF')
  async followUpReminder(
    @Args('id') id: string,
    @Context() context: any,
  ): Promise<FollowUpReminder> {
    const user = context.req.user;
    const organisationId = user.organisationId;
    const branchId = user.role === 'SUPER_ADMIN' ? undefined : user.branchId;

    return this.followUpReminderService.getFollowUpReminderById(
      id,
      organisationId,
      branchId,
    ) as any;
  }

  @Mutation(() => Boolean)
  @Roles('SUPER_ADMIN', 'BRANCH_ADMIN', 'PASTOR', 'STAFF')
  async deleteFollowUpReminder(
    @Args('id') id: string,
    @Context() context: any,
  ): Promise<boolean> {
    const user = context.req.user;
    const organisationId = user.organisationId;
    const branchId = user.role === 'SUPER_ADMIN' ? undefined : user.branchId;

    return this.followUpReminderService.deleteFollowUpReminder(
      id,
      organisationId,
      branchId,
    );
  }

  @Mutation(() => FollowUpReminder)
  // @Roles('SUPER_ADMIN', 'BRANCH_ADMIN', 'PASTOR', 'STAFF')
  async completeFollowUpReminder(
    @Args('id') id: string,
    @Args('notes', { nullable: true }) notes?: string,
    @Context() context?: any,
  ): Promise<FollowUpReminder> {
    const user = context.req.user;
    const organisationId = user.organisationId;
    const branchId = user.role === 'SUPER_ADMIN' ? undefined : user.branchId;

    return this.followUpReminderService.completeFollowUpReminder(
      id,
      notes,
      organisationId,
      branchId,
    ) as any;
  }

  @Query(() => [FollowUpReminder])
  // @Roles('SUPER_ADMIN', 'BRANCH_ADMIN', 'PASTOR', 'STAFF')
  async overdueFollowUpReminders(
    @Context() context: any,
  ): Promise<FollowUpReminder[]> {
    const user = context.req.user;
    const organisationId = user.organisationId;
    const branchId = user.role === 'SUPER_ADMIN' ? undefined : user.branchId;

    return this.followUpReminderService.getOverdueReminders(
      organisationId,
      branchId,
    ) as any;
  }

  @Query(() => [FollowUpReminder])
  // @Roles('SUPER_ADMIN', 'BRANCH_ADMIN', 'PASTOR', 'STAFF')
  async myFollowUpReminders(
    @Args('status', { nullable: true }) status?: FollowUpStatus,
    @Context() context?: any,
  ): Promise<FollowUpReminder[]> {
    const user = context.req.user;
    const organisationId = user.organisationId;
    const branchId = user.role === 'SUPER_ADMIN' ? undefined : user.branchId;

    return this.followUpReminderService.getRemindersByAssignee(
      user.id,
      organisationId,
      branchId,
      status,
    ) as any;
  }

  @Query(() => [FollowUpReminder])
  // @Roles('SUPER_ADMIN', 'BRANCH_ADMIN', 'PASTOR', 'STAFF')
  async dueTodayFollowUpReminders(
    @Context() context: any,
  ): Promise<FollowUpReminder[]> {
    const user = context.req.user;
    const organisationId = user.organisationId;
    const branchId = user.role === 'SUPER_ADMIN' ? undefined : user.branchId;

    return this.followUpReminderService.getDueTodayReminders(
      organisationId,
      branchId,
    ) as any;
  }

  @Query(() => [FollowUpReminder])
  // @Roles('SUPER_ADMIN', 'BRANCH_ADMIN', 'PASTOR', 'STAFF')
  async assigneeFollowUpReminders(
    @Args('assignedToId') assignedToId: string,
    @Args('status', { nullable: true }) status?: FollowUpStatus,
    @Context() context?: any,
  ): Promise<FollowUpReminder[]> {
    const user = context.req.user;
    const organisationId = user.organisationId;
    const branchId = user.role === 'SUPER_ADMIN' ? undefined : user.branchId;

    return this.followUpReminderService.getRemindersByAssignee(
      assignedToId,
      organisationId,
      branchId,
      status,
    ) as any;
  }
}
