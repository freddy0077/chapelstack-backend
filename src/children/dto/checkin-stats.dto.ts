import { Field, ObjectType, Int, ID } from '@nestjs/graphql';

@ObjectType()
class CheckInEventStats {
  @Field(() => ID)
  eventId: string;

  @Field(() => Int)
  _count: number;
}

@ObjectType()
export class CheckInStatsOutput {
  @Field(() => Int)
  totalCheckIns: number;

  @Field(() => Int)
  totalCheckOuts: number;

  @Field(() => Int)
  uniqueChildrenCount: number;

  @Field(() => [CheckInEventStats])
  checkInsByEvent: CheckInEventStats[];
}
