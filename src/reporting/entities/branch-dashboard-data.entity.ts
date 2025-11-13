import { ObjectType, Field, Int } from '@nestjs/graphql';;

@ObjectType()
export class BranchAdminDto {
  @Field(() => String)
  id: string;

  @Field(() => String)
  name: string;
}

@ObjectType()
export class BranchInfoDto {
  @Field(() => String)
  id: string;

  @Field(() => String)
  name: string;

  @Field({ nullable: true })
  organisation?: string;

  @Field(() => Boolean)
  isActive: boolean;

  @Field(() => [BranchAdminDto])
  admins: BranchAdminDto[];
}

@ObjectType()
export class MemberMonthlyTrendDto {
  @Field(() => Int)
  month: number;

  @Field(() => Int)
  year: number;

  @Field(() => Int)
  totalMembers: number;

  @Field(() => Int)
  newMembers: number;
}

@ObjectType()
export class MemberStatsDto {
  @Field(() => Int)
  total: number;

  @Field(() => Int)
  newMembersThisMonth: number;

  @Field(() => Int)
  growthRate: number;

  @Field(() => [MemberMonthlyTrendDto])
  monthlyTrends: MemberMonthlyTrendDto[];
}

@ObjectType()
export class FinanceMonthlyTrendDto {
  @Field(() => Int)
  month: number;

  @Field(() => Int)
  year: number;

  @Field(() => Number)
  contributions: number;

  @Field(() => Number)
  expenses: number;

  @Field(() => Number)
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
  @Field(() => Int)
  month: number;

  @Field(() => Int)
  year: number;

  @Field(() => Int)
  totalAttendance: number;

  @Field(() => Int)
  uniqueAttendees: number;
}

@ObjectType()
export class AttendanceStatsDto {
  @Field(() => Int)
  totalAttendance: number;

  @Field(() => Int)
  uniqueAttendeesThisMonth: number;

  @Field(() => Int)
  averageAttendance: number;

  @Field(() => Int)
  growthRate: number;

  @Field(() => [AttendanceMonthlyTrendDto])
  monthlyTrends: AttendanceMonthlyTrendDto[];
}

@ObjectType()
export class SacramentBreakdownDto {
  @Field(() => String)
  type: string;

  @Field(() => Int)
  count: number;
}

@ObjectType()
export class SacramentMonthlyTrendDto {
  @Field(() => Int)
  month: number;

  @Field(() => Int)
  count: number;
}

@ObjectType()
export class SacramentStatsDto {
  @Field(() => Int)
  totalSacraments: number;

  @Field(() => [SacramentBreakdownDto])
  breakdown: SacramentBreakdownDto[];

  @Field(() => [SacramentMonthlyTrendDto])
  monthlyTrends: SacramentMonthlyTrendDto[];
}

@ObjectType()
export class EventDto {
  @Field(() => String)
  id: string;

  @Field(() => String)
  title: string;

  @Field(() => Date)
  startDate: Date;
}

@ObjectType()
export class RecentMemberDto {
  @Field(() => String)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => Date)
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
  @Field(() => String)
  id: string;

  @Field(() => String)
  type: string;

  @Field(() => Date)
  date: Date;

  @Field(() => String)
  memberName: string;
}

@ObjectType()
export class ActivitySummaryDto {
  @Field(() => Int)
  newMembersCount: number;

  @Field(() => Int)
  contributionsCount: number;

  @Field(() => Int)
  sacramentsCount: number;

  @Field(() => Int)
  attendanceRecordsCount: number;

  @Field(() => Int)
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
  @Field(() => Int)
  rss: number;

  @Field(() => Int)
  heapTotal: number;

  @Field(() => Int)
  heapUsed: number;

  @Field(() => Int)
  external: number;
}

@ObjectType()
export class CpuUsageDto {
  @Field(() => Int)
  user: number;

  @Field(() => Int)
  system: number;
}

@ObjectType()
export class SystemDatabaseDto {
  @Field(() => String)
  status: string;

  @Field(() => Int)
  latency: number;
}

@ObjectType()
export class SystemInfoDto {
  @Field(() => Int)
  totalMemory: number;

  @Field(() => Int)
  freeMemory: number;

  @Field(() => MemoryUsageDto)
  memoryUsage: MemoryUsageDto;

  @Field(() => CpuUsageDto)
  cpuUsage: CpuUsageDto;

  @Field(() => Int)
  systemUptime: number;

  @Field(() => Int)
  processUptime: number;

  @Field(() => String)
  platform: string;

  @Field(() => String)
  nodeVersion: string;
}

@ObjectType()
export class SystemStatusDto {
  @Field(() => Date)
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
