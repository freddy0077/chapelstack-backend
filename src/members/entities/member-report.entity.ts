import { ObjectType, Field, Int, Float } from '@nestjs/graphql';

@ObjectType()
export class MemberReportSummary {
  @Field(() => String)
  title: string;

  @Field(() => String)
  startDate: string;

  @Field(() => String)
  endDate: string;

  @Field(() => Int)
  totalMembers: number;

  @Field(() => Int)
  activeMembers: number;

  @Field(() => Int)
  inactiveMembers: number;

  @Field(() => Int)
  newMembers: number;

  @Field(() => Int)
  visitors: number;

  @Field(() => Int)
  firstTimeVisitors: number;

  @Field(() => Int)
  returningVisitors: number;

  @Field(() => Float)
  growthRate: number;

  @Field(() => Float)
  retentionRate: number;

  @Field(() => Float)
  conversionRate: number;

  @Field(() => Float)
  averageAge: number;

  @Field(() => Int)
  maleMembers: number;

  @Field(() => Int)
  femaleMembers: number;
}

@ObjectType()
export class MemberReportData {
  @Field(() => String)
  period: string;

  @Field(() => Int)
  totalMembers: number;

  @Field(() => Int)
  activeMembers: number;

  @Field(() => Int)
  inactiveMembers: number;

  @Field(() => Int)
  newMembers: number;

  @Field(() => Int)
  visitors: number;

  @Field(() => Float, { nullable: true })
  growthRate?: number;

  @Field(() => Float, { nullable: true })
  retentionRate?: number;

  @Field(() => Float, { nullable: true })
  conversionRate?: number;
}

@ObjectType()
export class MemberDemographic {
  @Field(() => String)
  category: string;

  @Field(() => String)
  value: string;

  @Field(() => Int)
  count: number;

  @Field(() => Float)
  percentage: number;
}

@ObjectType()
export class MemberEngagement {
  @Field(() => String)
  memberId: string;

  @Field(() => String)
  name: string;

  @Field({ nullable: true })
  email?: string;

  @Field(() => Int)
  attendanceCount: number;

  @Field(() => Float)
  attendanceRate: number;

  @Field({ nullable: true })
  lastAttendance?: string;

  @Field(() => Int)
  eventParticipation: number;

  @Field(() => Float)
  engagementScore: number;
}

@ObjectType()
export class MemberGeographic {
  @Field(() => String)
  location: string;

  @Field(() => Int)
  memberCount: number;

  @Field(() => Float)
  percentage: number;

  @Field({ nullable: true })
  averageAge?: number;

  @Field({ nullable: true })
  primaryGender?: string;
}

@ObjectType()
export class MemberReportChart {
  @Field(() => String)
  type: string;

  @Field(() => String)
  title: string;

  @Field(() => [String])
  labels: string[];

  @Field(() => String)
  data: string;

  @Field(() => [String])
  colors: string[];
}

@ObjectType()
export class MemberReport {
  @Field(() => String)
  id: string;

  @Field(() => MemberReportSummary)
  summary: MemberReportSummary;

  @Field(() => [MemberReportData])
  data: MemberReportData[];

  @Field(() => [MemberDemographic], { nullable: true })
  demographics?: MemberDemographic[];

  @Field(() => [MemberEngagement], { nullable: true })
  engagement?: MemberEngagement[];

  @Field(() => [MemberGeographic], { nullable: true })
  geographic?: MemberGeographic[];

  @Field(() => [MemberReportChart], { nullable: true })
  charts?: MemberReportChart[];

  @Field(() => String)
  generatedAt: string;

  @Field({ nullable: true })
  downloadUrl?: string;
}
