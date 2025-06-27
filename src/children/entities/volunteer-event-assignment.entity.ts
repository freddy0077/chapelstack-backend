import { Field, ID, ObjectType } from '@nestjs/graphql';
import { GraphQLISODateTime } from '@nestjs/graphql';
import { ChildrenMinistryVolunteer } from './children-ministry-volunteer.entity';
import { ChildrenEvent } from './children-event.entity';

@ObjectType()
export class VolunteerEventAssignment {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  volunteerId: string;

  @Field(() => String)
  eventId: string;

  @Field(() => String, { nullable: true })
  role: string | null;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;

  // Relations - can be exposed via resolvers when needed
  volunteer?: ChildrenMinistryVolunteer;
  event?: ChildrenEvent;
}
