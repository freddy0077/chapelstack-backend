import { ObjectType, Field, ID } from '@nestjs/graphql';
import { GraphQLISODateTime } from '@nestjs/graphql';
import { Branch } from '../../branches/entities/branch.entity';
import { User } from '../../users/entities/user.entity';
import { AttendanceRecord } from '../../attendance/entities/attendance-record.entity';

@ObjectType()
export class Event {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => GraphQLISODateTime)
  startDate: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  endDate?: Date;

  @Field({ nullable: true })
  location?: string;

  @Field({ nullable: true })
  category?: string;

  @Field({ nullable: true })
  branchId?: string;

  @Field({ nullable: true })
  organisationId?: string;

  @Field({ nullable: true })
  createdBy?: string;

  @Field({ nullable: true })
  updatedBy?: string;

  @Field(() => Branch, { nullable: true })
  branch?: Branch;

  @Field(() => [User], { nullable: true })
  attendees?: User[];

  @Field(() => User, { nullable: true })
  creator?: User;

  @Field(() => [AttendanceRecord], { nullable: true })
  attendanceRecords?: AttendanceRecord[];

  @Field(() => GraphQLISODateTime, { nullable: true })
  createdAt?: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  updatedAt?: Date;
}
