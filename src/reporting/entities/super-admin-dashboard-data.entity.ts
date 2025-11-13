import { Field, ObjectType, Int } from '@nestjs/graphql';;
import { SystemHealth } from '../../admin/entities/system-health.entity';

@ObjectType()
export class OrganisationInfo {
  @Field(() => String)
  id: string;
  @Field(() => String)
  name: string;
  @Field(() => Int)
  branchCount: number;
  @Field(() => Int)
  adminCount: number;
}

@ObjectType()
export class OrganisationOverview {
  @Field(() => Int)
  total: number;
  @Field(() => [OrganisationInfo])
  organisations: OrganisationInfo[];
}

@ObjectType()
export class BranchInfo {
  @Field(() => String)
  id: string;
  @Field(() => String)
  name: string;
  @Field({ nullable: true })
  organisation?: string;
  @Field({ nullable: true })
  status?: string;
}

@ObjectType()
export class BranchesSummary {
  @Field(() => Int)
  total: number;
  @Field(() => [BranchInfo])
  branches: BranchInfo[];
}

@ObjectType()
export class MemberSummary {
  @Field(() => Int)
  total: number;
  @Field({ nullable: true })
  newMembersThisMonth?: number;
}

@ObjectType()
export class TopGivingBranch {
  @Field(() => String)
  branchId: string;

  @Field(() => String)
  branchName: string;

  @Field(() => Int)
  totalGiven: number;
}

@ObjectType()
export class FinancialOverview {
  @Field(() => Int)
  totalContributions: number;

  @Field(() => Int)
  tithes: number;

  @Field(() => Int)
  expenses: number;

  @Field(() => Int)
  pledge: number;

  @Field(() => Int)
  offering: number;

  @Field(() => Int)
  donation: number;

  @Field(() => Int)
  specialContribution: number;

  @Field(() => [TopGivingBranch])
  topGivingBranches: TopGivingBranch[];
}

@ObjectType()
export class AttendanceOverview {
  @Field(() => Int)
  totalAttendance: number;
}

@ObjectType()
export class SacramentsOverview {
  @Field(() => Int)
  totalSacraments: number;
}

@ObjectType()
export class EventInfo {
  @Field(() => String)
  id: string;
  @Field(() => String)
  title: string;
  @Field(() => Date)
  startDate: Date;
}

@ObjectType()
export class ActivityEngagement {
  @Field(() => [EventInfo])
  recentEvents: EventInfo[];
  @Field(() => [EventInfo])
  upcomingEvents: EventInfo[];
}

@ObjectType()
export class AnnouncementInfo {
  @Field(() => String)
  id: string;
  @Field(() => String)
  title: string;
  @Field(() => Date)
  startDate: Date;
}

@ObjectType()
export class Announcements {
  @Field(() => [AnnouncementInfo])
  announcements: AnnouncementInfo[];
}

@ObjectType()
export class SuperAdminDashboardData {
  @Field(() => OrganisationOverview)
  organisationOverview: OrganisationOverview;

  @Field(() => BranchesSummary)
  branchesSummary: BranchesSummary;

  @Field(() => MemberSummary)
  memberSummary: MemberSummary;

  @Field(() => FinancialOverview)
  financialOverview: FinancialOverview;

  @Field(() => AttendanceOverview)
  attendanceOverview: AttendanceOverview;

  @Field(() => SacramentsOverview)
  sacramentsOverview: SacramentsOverview;

  @Field(() => ActivityEngagement)
  activityEngagement: ActivityEngagement;

  @Field(() => SystemHealth)
  systemHealth: SystemHealth;

  @Field(() => Announcements)
  announcements: Announcements;
}
