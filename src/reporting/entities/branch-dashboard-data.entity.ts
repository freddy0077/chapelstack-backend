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
export class MemberStatsDto {
  @Field()
  total: number;

  @Field()
  newMembersThisMonth: number;
}

@ObjectType()
export class FinanceStatsDto {
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
export class AttendanceStatsDto {
  @Field()
  totalAttendance: number;
}

@ObjectType()
export class SacramentStatsDto {
  @Field()
  totalSacraments: number;
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
export class ActivityStatsDto {
  @Field(() => [EventDto])
  recentEvents: EventDto[];

  @Field(() => [EventDto])
  upcomingEvents: EventDto[];
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
