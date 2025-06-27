import { Field, ID, ObjectType } from '@nestjs/graphql';
import { GraphQLISODateTime } from '@nestjs/graphql';
import { VolunteerEventAssignment } from './volunteer-event-assignment.entity';

@ObjectType()
export class ChildrenMinistryVolunteer {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  memberId: string;

  @Field(() => String)
  role: string;

  @Field(() => GraphQLISODateTime, { nullable: true })
  backgroundCheckDate: Date | null;

  @Field(() => String, { nullable: true })
  backgroundCheckStatus: string | null;

  @Field(() => GraphQLISODateTime, { nullable: true })
  trainingCompletionDate: Date | null;

  @Field(() => Boolean)
  isActive: boolean;

  @Field(() => String, { nullable: true })
  notes: string | null;

  @Field(() => String)
  branchId: string;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;

  // Relations - can be exposed via resolvers when needed
  eventAssignments?: VolunteerEventAssignment[];
}
