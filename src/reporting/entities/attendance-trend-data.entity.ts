import { Field, ObjectType, ID } from '@nestjs/graphql';

@ObjectType()
export class AttendanceDataPoint {
  @Field(() => Date)
  date: Date;

  @Field(() => Number)
  count: number;

  @Field(() => Number, { nullable: true })
  percentChange?: number;
}

@ObjectType()
export class AttendanceTrendData {
  @Field(() => ID, { nullable: true })
  branchId?: string;

  @Field(() => ID, { nullable: true })
  organisationId?: string;

  @Field({ nullable: true })
  branchName?: string;

  @Field(() => String, { nullable: true })
  eventTypeId?: string;

  @Field(() => String, { nullable: true })
  eventTypeName?: string;

  @Field(() => Date)
  startDate: Date;

  @Field(() => Date)
  endDate: Date;

  @Field(() => Number)
  totalAttendance: number;

  @Field(() => Number)
  averageAttendance: number;

  @Field(() => Number, { nullable: true })
  percentChangeFromPreviousPeriod?: number;

  @Field(() => [AttendanceDataPoint])
  trendData: AttendanceDataPoint[];
}
