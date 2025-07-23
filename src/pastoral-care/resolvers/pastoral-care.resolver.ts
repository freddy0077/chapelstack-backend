import {
  Resolver,
  Query,
  Mutation,
  Args,
  Context,
  ObjectType,
  Field,
  Int,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { PastoralCareService } from '../services/pastoral-care.service';
import { FollowUpReminder } from '../dto/follow-up-reminder.dto';
import { PastoralVisit } from '../dto/pastoral-visit.dto';
import { CounselingSession } from '../dto/counseling-session.dto';
import { CareRequest } from '../dto/care-request.dto';

@ObjectType()
export class PastoralCareStats {
  @Field(() => Int)
  totalVisits: number;

  @Field(() => Int)
  completedVisits: number;

  @Field(() => Int)
  upcomingVisits: number;

  @Field(() => Int)
  totalSessions: number;

  @Field(() => Int)
  completedSessions: number;

  @Field(() => Int)
  upcomingSessions: number;

  @Field(() => Int)
  totalCareRequests: number;

  @Field(() => Int)
  openCareRequests: number;

  @Field(() => Int)
  resolvedCareRequests: number;

  @Field(() => Int)
  totalReminders: number;

  @Field(() => Int)
  pendingReminders: number;

  @Field(() => Int)
  overdueReminders: number;
}

@ObjectType()
export class PastoralCareDashboard {
  @Field(() => PastoralCareStats)
  stats: PastoralCareStats;

  @Field(() => [PastoralVisit])
  upcomingVisits: PastoralVisit[];

  @Field(() => [CounselingSession])
  upcomingSessions: CounselingSession[];

  @Field(() => [CareRequest])
  urgentCareRequests: CareRequest[];

  @Field(() => [FollowUpReminder])
  dueTodayReminders: FollowUpReminder[];

  @Field(() => [FollowUpReminder])
  overdueReminders: FollowUpReminder[];
}

@ObjectType()
export class MemberPastoralHistory {
  @Field(() => [PastoralVisit])
  visits: PastoralVisit[];

  @Field(() => [CounselingSession])
  sessions: CounselingSession[];

  @Field(() => [CareRequest])
  careRequests: CareRequest[];

  @Field(() => [FollowUpReminder])
  reminders: FollowUpReminder[];
}

@ObjectType()
export class PastorWorkloadStats {
  @Field()
  totalVisits: number;

  @Field()
  totalSessions: number;

  @Field()
  totalCareRequests: number;

  @Field()
  totalReminders: number;

  @Field({ nullable: true })
  completionRate?: number;
}

@ObjectType()
export class PastorWorkload {
  @Field(() => [PastoralVisit])
  upcomingVisits: PastoralVisit[];

  @Field(() => [CounselingSession])
  upcomingSessions: CounselingSession[];

  @Field(() => [CareRequest])
  assignedCareRequests: CareRequest[];

  @Field(() => [FollowUpReminder])
  assignedReminders: FollowUpReminder[];

  @Field(() => PastorWorkloadStats)
  stats: PastorWorkloadStats;
}

@ObjectType()
export class PastoralCareActivity {
  @Field()
  id: string;

  @Field()
  type: string;

  @Field()
  title: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field()
  date: Date;

  @Field(() => String, { nullable: true })
  memberName?: string;

  @Field(() => String, { nullable: true })
  pastorName?: string;
}

@Resolver()
@UseGuards(JwtAuthGuard, RolesGuard)
export class PastoralCareResolver {
  constructor(private pastoralCareService: PastoralCareService) {}

  @Query(() => PastoralCareStats)
  // @Roles('SUPER_ADMIN', 'BRANCH_ADMIN', 'PASTOR', 'STAFF')
  async pastoralCareStats(@Context() context: any): Promise<PastoralCareStats> {
    const user = context.req.user;
    const organisationId = user.organisationId;
    const branchId = user.role === 'SUPER_ADMIN' ? undefined : user.branchId;

    return this.pastoralCareService.getPastoralCareStats(
      organisationId,
      branchId,
    );
  }

  @Query(() => PastoralCareDashboard)
  // @Roles('SUPER_ADMIN', 'BRANCH_ADMIN', 'PASTOR', 'STAFF')
  async pastoralCareDashboard(
    @Context() context: any,
  ): Promise<PastoralCareDashboard> {
    const user = context.req.user;
    const organisationId = user.organisationId;
    const branchId = user.role === 'SUPER_ADMIN' ? undefined : user.branchId;

    return this.pastoralCareService.getPastoralCareDashboard(
      organisationId,
      branchId,
    );
  }

  @Mutation(() => FollowUpReminder)
  // @Roles('SUPER_ADMIN', 'BRANCH_ADMIN', 'PASTOR', 'STAFF')
  async createFollowUpFromVisit(
    @Args('visitId') visitId: string,
    @Args('assignedToId') assignedToId: string,
    @Args('dueDate') dueDate: string,
    @Context() context: any,
  ): Promise<FollowUpReminder> {
    const user = context.req.user;
    const organisationId = user.organisationId;
    const branchId = user.role === 'SUPER_ADMIN' ? undefined : user.branchId;

    return this.pastoralCareService.createFollowUpFromVisit(
      visitId,
      assignedToId,
      new Date(dueDate),
      organisationId,
      branchId,
      user.id,
    ) as any;
  }

  @Mutation(() => FollowUpReminder)
  // @Roles('SUPER_ADMIN', 'BRANCH_ADMIN', 'PASTOR', 'STAFF')
  async createFollowUpFromSession(
    @Args('sessionId') sessionId: string,
    @Args('assignedToId') assignedToId: string,
    @Args('dueDate') dueDate: string,
    @Context() context: any,
  ): Promise<FollowUpReminder> {
    const user = context.req.user;
    const organisationId = user.organisationId;
    const branchId = user.role === 'SUPER_ADMIN' ? undefined : user.branchId;

    return this.pastoralCareService.createFollowUpFromSession(
      sessionId,
      assignedToId,
      new Date(dueDate),
      organisationId,
      branchId,
      user.id,
    ) as any;
  }

  @Mutation(() => FollowUpReminder)
  // @Roles('SUPER_ADMIN', 'BRANCH_ADMIN', 'PASTOR', 'STAFF')
  async createFollowUpFromCareRequest(
    @Args('requestId') requestId: string,
    @Args('assignedToId') assignedToId: string,
    @Args('dueDate') dueDate: string,
    @Context() context: any,
  ): Promise<FollowUpReminder> {
    const user = context.req.user;
    const organisationId = user.organisationId;
    const branchId = user.role === 'SUPER_ADMIN' ? undefined : user.branchId;

    return this.pastoralCareService.createFollowUpFromCareRequest(
      requestId,
      assignedToId,
      new Date(dueDate),
      organisationId,
      branchId,
      user.id,
    ) as any;
  }

  @Query(() => MemberPastoralHistory)
  // @Roles('SUPER_ADMIN', 'BRANCH_ADMIN', 'PASTOR', 'STAFF')
  async memberPastoralHistory(
    @Args('memberId') memberId: string,
    @Context() context: any,
  ): Promise<MemberPastoralHistory> {
    const user = context.req.user;
    const organisationId = user.organisationId;
    const branchId = user.role === 'SUPER_ADMIN' ? undefined : user.branchId;

    return this.pastoralCareService.getMemberPastoralHistory(
      memberId,
      organisationId,
      branchId,
      user.id,
    );
  }

  @Query(() => PastorWorkload)
  @Roles('SUPER_ADMIN', 'BRANCH_ADMIN', 'PASTOR', 'STAFF')
  async pastorWorkload(
    @Args('pastorId') pastorId: string,
    @Context() context: any,
  ): Promise<PastorWorkload> {
    const user = context.req.user;
    const organisationId = user.organisationId;
    const branchId = user.role === 'SUPER_ADMIN' ? undefined : user.branchId;

    return this.pastoralCareService.getPastorWorkload(
      pastorId,
      organisationId,
      branchId,
    );
  }

  @Query(() => [PastoralCareActivity])
  // @Roles('SUPER_ADMIN', 'BRANCH_ADMIN', 'PASTOR', 'STAFF')
  async pastoralCareRecentActivity(
    @Args('days', { type: () => Int, defaultValue: 7 }) days: number,
    @Context() context: any,
  ): Promise<PastoralCareActivity[]> {
    const user = context.req.user;
    const organisationId = user.organisationId;
    const branchId = user.role === 'SUPER_ADMIN' ? undefined : user.branchId;

    return this.pastoralCareService.getRecentActivity(
      organisationId,
      branchId,
      days,
    ) as any;
  }
}
