import { Field, ObjectType, Int } from '@nestjs/graphql';

@ObjectType()
export class AttendanceTrendPoint {
  @Field()
  date: string;

  @Field(() => Int)
  count: number;
}

@ObjectType()
export class MembershipGrowthPoint {
  @Field()
  month: string;

  @Field(() => Int)
  count: number;
}

@ObjectType()
export class BranchGenderDistribution {
  @Field(() => Int)
  male: number;

  @Field(() => Int)
  female: number;

  @Field(() => Int)
  other: number;
}

@ObjectType()
export class BranchAgeDistribution {
  @Field(() => Int)
  under18: number;

  @Field(() => Int)
  age18To30: number;

  @Field(() => Int)
  age31To45: number;

  @Field(() => Int)
  age46To60: number;

  @Field(() => Int)
  over60: number;
}

@ObjectType()
export class MinistryParticipation {
  @Field()
  ministryName: string;

  @Field(() => Int)
  memberCount: number;
}

@ObjectType()
export class BranchStatistics {
  @Field(() => Int)
  totalMembers: number;

  @Field(() => Int)
  activeMembers: number;

  @Field(() => Int)
  inactiveMembers: number;

  @Field(() => Int)
  newMembersThisMonth: number;

  @Field(() => Int)
  totalAttendance: number;

  @Field(() => Int)
  averageWeeklyAttendance: number;

  @Field(() => [AttendanceTrendPoint])
  attendanceTrend: AttendanceTrendPoint[];

  @Field(() => [MembershipGrowthPoint])
  membershipGrowth: MembershipGrowthPoint[];

  @Field(() => BranchGenderDistribution)
  genderDistribution: BranchGenderDistribution;

  @Field(() => BranchAgeDistribution)
  ageDistribution: BranchAgeDistribution;

  @Field(() => [MinistryParticipation])
  ministryParticipation: MinistryParticipation[];
}
