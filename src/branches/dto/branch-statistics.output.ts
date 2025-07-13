import { Field, Int, Float, ObjectType } from '@nestjs/graphql';

@ObjectType('BranchStatistics')
export class BranchStatistics {
  @Field(() => Int, { description: 'Total number of members in this branch.' })
  totalMembers: number;

  @Field(() => Int, { description: 'Number of active members in this branch.' })
  activeMembers: number;

  @Field(() => Int, {
    description: 'Number of inactive members in this branch.',
  })
  inactiveMembers: number;

  @Field(() => Int, {
    description:
      'Number of new members who joined this branch in the relevant period (current or last month).',
  })
  newMembersInPeriod: number; // Renamed from newMembersThisMonth

  @Field(() => Int, {
    description: 'Total number of families in this branch.',
    nullable: true,
  })
  totalFamilies: number;

  @Field(() => Int, {
    description: 'Average weekly attendance in this branch.',
    nullable: true,
  })
  averageWeeklyAttendance: number;

  @Field(() => Int, {
    description: 'Total number of ministries in this branch.',
    nullable: true,
  })
  totalMinistries: number;

  @Field(() => Int, {
    description: 'Number of baptisms year-to-date in this branch.',
    nullable: true,
  })
  baptismsYTD: number;

  @Field(() => Int, {
    description: 'Number of first communions year-to-date in this branch.',
    nullable: true,
  })
  firstCommunionsYTD: number;

  @Field(() => Int, {
    description: 'Number of confirmations year-to-date in this branch.',
    nullable: true,
  })
  confirmationsYTD: number;

  @Field(() => Int, {
    description: 'Number of marriages year-to-date in this branch.',
    nullable: true,
  })
  marriagesYTD: number;

  @Field(() => Float, {
    description: 'Annual budget for this branch.',
    nullable: true,
  })
  annualBudget?: number;

  @Field(() => Float, {
    description: 'Year-to-date income for this branch.',
    nullable: true,
  })
  ytdIncome?: number;

  @Field(() => Float, {
    description: 'Year-to-date expenses for this branch.',
    nullable: true,
  })
  ytdExpenses?: number;

  @Field(() => BranchStatistics, {
    nullable: true,
    description: 'Statistics for the previous month.',
  })
  lastMonth?: BranchStatistics;
}
