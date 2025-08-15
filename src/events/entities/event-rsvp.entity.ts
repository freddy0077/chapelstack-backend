import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { GraphQLISODateTime } from '@nestjs/graphql';
import { RSVPStatus } from '../enums/graphql-enums';
import { Event } from './event.entity';
import { Member } from '../../members/entities/member.entity';

@ObjectType()
export class EventRSVP {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  eventId: string;

  @Field(() => Event, { nullable: true })
  event?: Event;

  @Field(() => ID, { nullable: true })
  memberId?: string | null;

  @Field(() => Member, { nullable: true })
  member?: Member;

  // Guest RSVP fields (for non-members)
  @Field(() => String, { nullable: true })
  guestName?: string | null;

  @Field(() => String, { nullable: true })
  guestEmail?: string | null;

  @Field(() => String, { nullable: true })
  guestPhone?: string | null;

  // RSVP details
  @Field(() => RSVPStatus)
  status: RSVPStatus;

  @Field(() => GraphQLISODateTime)
  responseDate: Date;

  @Field(() => Int)
  numberOfGuests: number;

  @Field(() => String, { nullable: true })
  message?: string | null;

  // Metadata
  @Field(() => String, { nullable: true })
  rsvpSource?: string | null;

  @Field(() => String, { nullable: true })
  createdBy?: string | null;

  @Field(() => String, { nullable: true })
  updatedBy?: string | null;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;
}
