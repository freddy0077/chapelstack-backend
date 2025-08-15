import { ObjectType, Field, ID } from '@nestjs/graphql';
import { GraphQLISODateTime } from '@nestjs/graphql';

@ObjectType()
export class MemberAnalytics {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  memberId: string;

  @Field(() => Number, { defaultValue: 0 })
  totalAttendances: number;

  @Field(() => Number, { defaultValue: 0.0 })
  attendanceRate: number;

  @Field(() => Number, { defaultValue: 0 })
  attendanceStreak: number;

  @Field(() => Number, { defaultValue: 0.0 })
  totalContributions: number;

  @Field(() => Number, { defaultValue: 0.0 })
  engagementScore: number;

  @Field(() => String, { defaultValue: 'NEW' })
  engagementLevel: string;

  @Field(() => Number, { defaultValue: 0 })
  ministriesCount: number;

  @Field(() => Number, { defaultValue: 0 })
  leadershipRoles: number;

  @Field(() => Number, { defaultValue: 0.0 })
  volunteerHours: number;

  @Field(() => Number, { defaultValue: 0.0 })
  emailOpenRate: number;

  @Field(() => Number, { defaultValue: 0.0 })
  smsResponseRate: number;

  @Field(() => Number, { nullable: true })
  membershipDuration?: number;

  @Field(() => String, { nullable: true })
  ageGroup?: string;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;

  @Field(() => GraphQLISODateTime)
  lastCalculated: Date;

  // Note: We'll add the Member relation in the resolver using @ResolveField
  // to avoid circular references
}
