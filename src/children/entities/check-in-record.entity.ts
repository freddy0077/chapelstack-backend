import { Field, ID, ObjectType } from '@nestjs/graphql';
import { GraphQLISODateTime } from '@nestjs/graphql';
import { Child } from './child.entity';
import { Guardian } from './guardian.entity';
import { ChildrenEvent } from './children-event.entity';

@ObjectType()
export class CheckInRecord {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  childId: string;

  @Field(() => String, { nullable: true })
  eventId: string | null;

  @Field(() => String)
  checkedInById: string;

  @Field(() => GraphQLISODateTime)
  checkedInAt: Date;

  @Field(() => String, { nullable: true })
  checkedOutById: string | null;

  @Field(() => GraphQLISODateTime, { nullable: true })
  checkedOutAt: Date | null;

  @Field(() => String)
  guardianIdAtCheckIn: string;

  @Field(() => String, { nullable: true })
  guardianIdAtCheckOut: string | null;

  @Field(() => String, { nullable: true })
  notes: string | null;

  @Field(() => String)
  branchId: string;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;

  // Relations - can be exposed via resolvers when needed
  child?: Child;
  event?: ChildrenEvent | null;
  checkedInBy?: Guardian;
  checkedOutBy?: Guardian | null;
}
