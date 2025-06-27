import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ChildrenEvent } from '../entities/children-event.entity';
import { CheckInRecord } from '../entities/check-in-record.entity';

@ObjectType()
export class EventAttendanceStats {
  @Field(() => Int)
  totalCheckedIn: number;

  @Field(() => Int)
  totalCheckedOut: number;

  @Field(() => Int)
  currentlyPresent: number;
}

@ObjectType()
export class EventAttendanceOutput {
  @Field(() => ChildrenEvent)
  event: ChildrenEvent;

  @Field(() => [CheckInRecord])
  checkIns: CheckInRecord[];

  @Field(() => EventAttendanceStats)
  stats: EventAttendanceStats;
}
