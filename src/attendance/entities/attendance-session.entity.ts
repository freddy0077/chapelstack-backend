import { ObjectType, Field, ID } from '@nestjs/graphql';
import { GraphQLISODateTime } from '@nestjs/graphql';
import { AttendanceRecord } from './attendance-record.entity';

@ObjectType()
export class AttendanceSession {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => GraphQLISODateTime)
  date: Date;

  @Field(() => GraphQLISODateTime)
  startTime: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  endTime?: Date;

  @Field()
  type: string;

  @Field()
  status: string;

  @Field({ nullable: true })
  location?: string;

  @Field({ nullable: true })
  latitude?: number;

  @Field({ nullable: true })
  longitude?: number;

  @Field({ nullable: true })
  branchId?: string;

  @Field({ nullable: true })
  organisationId?: string;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;

  @Field(() => [AttendanceRecord], { nullable: true })
  attendanceRecords?: AttendanceRecord[];
}
