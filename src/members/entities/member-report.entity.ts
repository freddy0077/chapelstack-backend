import { ObjectType, Field, Int, Float } from '@nestjs/graphql';

@ObjectType()
export class MemberReportSummary {
  @Field()
  title: string;

  @Field()
  startDate: string;

  @Field()
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
  @Field()
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
  @Field()
  category: string;

  @Field()
  value: string;

  @Field(() => Int)
  count: number;

  @Field(() => Float)
  percentage: number;
}

@ObjectType()
export class MemberEngagement {
  @Field()
  memberId: string;

  @Field()
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
  @Field()
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
  @Field()
  type: string;

  @Field()
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
  @Field()
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

  @Field()
  generatedAt: string;

  @Field({ nullable: true })
  downloadUrl?: string;
}
