import { Field, ObjectType } from '@nestjs/graphql';
import { VolunteerEventAssignment } from '../entities/volunteer-event-assignment.entity';
import { ChildrenEvent } from '../entities/children-event.entity';

@ObjectType()
export class VolunteerScheduleItem {
  @Field(() => VolunteerEventAssignment)
  assignment: VolunteerEventAssignment;

  @Field(() => ChildrenEvent)
  event: ChildrenEvent;
}
