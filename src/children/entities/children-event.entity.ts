import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { GraphQLISODateTime } from '@nestjs/graphql';
import { CheckInRecord } from './check-in-record.entity';
import { VolunteerEventAssignment } from './volunteer-event-assignment.entity';

@ObjectType()
export class ChildrenEvent {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  description: string | null;

  @Field(() => GraphQLISODateTime)
  startDateTime: Date;

  @Field(() => GraphQLISODateTime)
  endDateTime: Date;

  @Field(() => String)
  location: string;

  @Field(() => String, { nullable: true })
  ageRange: string | null;

  @Field(() => Int, { nullable: true })
  capacity: number | null;

  @Field(() => Int, { nullable: true })
  volunteersNeeded: number | null;

  @Field(() => String)
  branchId: string;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;

  // Relations - can be exposed via resolvers when needed
  checkInRecords?: CheckInRecord[];
  volunteerAssignments?: VolunteerEventAssignment[];
}
