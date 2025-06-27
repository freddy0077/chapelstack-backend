import { Field, Int, ObjectType } from '@nestjs/graphql';

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

  @Field(() => BranchStatistics, {
    nullable: true,
    description: 'Statistics for the previous month.',
  })
  lastMonth?: BranchStatistics;
}
