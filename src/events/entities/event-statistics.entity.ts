import { ObjectType, Field, Int, Float } from '@nestjs/graphql';

@ObjectType()
export class EventStatistics {
  @Field(() => Int)
  totalEvents: number;

  @Field(() => Int)
  totalRegistrations: number;

  @Field(() => Float)
  totalRevenue: number;

  @Field(() => Int)
  pendingApprovals: number;

  @Field(() => Int)
  confirmedRegistrations: number;

  @Field(() => Float)
  averageAttendanceRate: number;
}
