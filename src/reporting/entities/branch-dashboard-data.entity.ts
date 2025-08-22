import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class BranchAdminDto {
  @Field()
  id: string;

  @Field()
  name: string;
}

@ObjectType()
export class BranchInfoDto {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  organisation?: string;

  @Field()
  isActive: boolean;

  @Field(() => [BranchAdminDto])
  admins: BranchAdminDto[];
}

@ObjectType()
export class MemberMonthlyTrendDto {
  @Field()
  month: number;

  @Field()
  year: number;

  @Field()
  totalMembers: number;

  @Field()
  newMembers: number;
}

@ObjectType()
export class MemberStatsDto {
  @Field()
  total: number;

  @Field()
  newMembersThisMonth: number;

  @Field()
  growthRate: number;

  @Field(() => [MemberMonthlyTrendDto])
  monthlyTrends: MemberMonthlyTrendDto[];
}

@ObjectType()
export class FinanceMonthlyTrendDto {
  @Field()
  month: number;

  @Field()
  year: number;

  @Field()
  contributions: number;

  @Field()
  expenses: number;

  @Field()
  netIncome: number;
}

@ObjectType()
export class FinanceStatsDto {
  @Field(() => Number)
  totalContributions: number;

  @Field(() => Number)
  totalExpenses: number;

  @Field(() => Number)
  tithes: number;

  @Field(() => Number)
  offering: number;

  @Field(() => Number)
  donation: number;

  @Field(() => Number)
  pledge: number;

  @Field(() => Number)
  specialContribution: number;

  @Field(() => Number)
  growthRate: number;

  @Field(() => Number)
  netIncome: number;

  @Field(() => [FinanceMonthlyTrendDto])
  monthlyTrends: FinanceMonthlyTrendDto[];
}

@ObjectType()
export class AttendanceMonthlyTrendDto {
  @Field()
  month: number;

  @Field()
  year: number;

  @Field()
  totalAttendance: number;

  @Field()
  uniqueAttendees: number;
}

@ObjectType()
export class AttendanceStatsDto {
  @Field()
  totalAttendance: number;

  @Field()
  uniqueAttendeesThisMonth: number;

  @Field()
  averageAttendance: number;

  @Field()
  growthRate: number;

  @Field(() => [AttendanceMonthlyTrendDto])
  monthlyTrends: AttendanceMonthlyTrendDto[];
}

@ObjectType()
export class SacramentBreakdownDto {
  @Field()
  type: string;

  @Field()
  count: number;
}

@ObjectType()
export class SacramentMonthlyTrendDto {
  @Field()
  month: number;

  @Field()
  count: number;
}

@ObjectType()
export class SacramentStatsDto {
  @Field()
  totalSacraments: number;

  @Field(() => [SacramentBreakdownDto])
  breakdown: SacramentBreakdownDto[];

  @Field(() => [SacramentMonthlyTrendDto])
  monthlyTrends: SacramentMonthlyTrendDto[];
}

@ObjectType()
export class EventDto {
  @Field()
  id: string;

  @Field()
  title: string;

  @Field()
  startDate: Date;
}

@ObjectType()
export class RecentMemberDto {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field()
  joinedAt: Date;
}

@ObjectType()
export class RecentContributionDto {
  @Field(() => String)
  id: string;

  @Field(() => Number)
  amount: number;

  @Field(() => Date)
  date: Date;

  @Field(() => String, { nullable: true })
  type?: string;
}

@ObjectType()
export class RecentSacramentDto {
  @Field()
  id: string;

  @Field()
  type: string;

  @Field()
  date: Date;

  @Field()
  memberName: string;
}

@ObjectType()
export class ActivitySummaryDto {
  @Field()
  newMembersCount: number;

  @Field()
  contributionsCount: number;

  @Field()
  sacramentsCount: number;

  @Field()
  attendanceRecordsCount: number;

  @Field()
  totalActivities: number;
}

@ObjectType()
export class ActivityStatsDto {
  @Field(() => [EventDto])
  recentEvents: EventDto[];

  @Field(() => [EventDto])
  upcomingEvents: EventDto[];

  @Field(() => [RecentMemberDto])
  recentMembers: RecentMemberDto[];

  @Field(() => [RecentContributionDto])
  recentContributions: RecentContributionDto[];

  @Field(() => [RecentSacramentDto])
  recentSacraments: RecentSacramentDto[];

  @Field(() => ActivitySummaryDto)
  activitySummary: ActivitySummaryDto;
}

@ObjectType()
export class MemoryUsageDto {
  @Field()
  rss: number;

  @Field()
  heapTotal: number;

  @Field()
  heapUsed: number;

  @Field()
  external: number;
}

@ObjectType()
export class CpuUsageDto {
  @Field()
  user: number;

  @Field()
  system: number;
}

@ObjectType()
export class SystemDatabaseDto {
  @Field()
  status: string;

  @Field()
  latency: number;
}

@ObjectType()
export class SystemInfoDto {
  @Field()
  totalMemory: number;

  @Field()
  freeMemory: number;

  @Field(() => MemoryUsageDto)
  memoryUsage: MemoryUsageDto;

  @Field(() => CpuUsageDto)
  cpuUsage: CpuUsageDto;

  @Field()
  systemUptime: number;

  @Field()
  processUptime: number;

  @Field()
  platform: string;

  @Field()
  nodeVersion: string;
}

@ObjectType()
export class SystemStatusDto {
  @Field()
  timestamp: Date;

  @Field(() => SystemDatabaseDto)
  database: SystemDatabaseDto;

  @Field(() => SystemInfoDto)
  system: SystemInfoDto;
}

@ObjectType()
export class BranchAnnouncementsDto {
  @Field(() => [EventDto])
  announcements: EventDto[];
}

@ObjectType()
export class BranchDashboardDataDto {
  @Field(() => BranchInfoDto)
  branchInfo: BranchInfoDto;

  @Field(() => MemberStatsDto)
  memberStats: MemberStatsDto;

  @Field(() => FinanceStatsDto)
  financeStats: FinanceStatsDto;

  @Field(() => AttendanceStatsDto)
  attendanceStats: AttendanceStatsDto;

  @Field(() => SacramentStatsDto)
  sacramentStats: SacramentStatsDto;

  @Field(() => ActivityStatsDto)
  activityStats: ActivityStatsDto;

  @Field(() => SystemStatusDto)
  systemStatus: SystemStatusDto;

  @Field(() => BranchAnnouncementsDto)
  branchAnnouncements: BranchAnnouncementsDto;
}
