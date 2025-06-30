import { Field, ObjectType } from '@nestjs/graphql';
import { SystemHealth } from '../../admin/entities/system-health.entity';

@ObjectType()
export class OrganisationInfo {
  @Field()
  id: string;
  @Field()
  name: string;
  @Field()
  branchCount: number;
  @Field()
  adminCount: number;
}

@ObjectType()
export class OrganisationOverview {
  @Field()
  total: number;
  @Field(() => [OrganisationInfo])
  organisations: OrganisationInfo[];
}

@ObjectType()
export class BranchInfo {
  @Field()
  id: string;
  @Field()
  name: string;
  @Field({ nullable: true })
  organisation?: string;
  @Field({ nullable: true })
  status?: string;
}

@ObjectType()
export class BranchesSummary {
  @Field()
  total: number;
  @Field(() => [BranchInfo])
  branches: BranchInfo[];
}

@ObjectType()
export class MemberSummary {
  @Field()
  total: number;
}

@ObjectType()
export class FinancialOverview {
  @Field()
  totalContributions: number;

  @Field()
  tithes: number;

  @Field()
  expenses: number;

  @Field()
  pledge: number;

  @Field()
  offering: number;

  @Field()
  donation: number;

  @Field()
  specialContribution: number;
}

@ObjectType()
export class AttendanceOverview {
  @Field()
  totalAttendance: number;
}

@ObjectType()
export class SacramentsOverview {
  @Field()
  totalSacraments: number;
}

@ObjectType()
export class EventInfo {
  @Field()
  id: string;
  @Field()
  title: string;
  @Field()
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
  @Field()
  id: string;
  @Field()
  title: string;
  @Field()
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
