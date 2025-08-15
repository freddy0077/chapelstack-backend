import { ObjectType, Field, ID, Int, Float } from '@nestjs/graphql';
import { GraphQLISODateTime } from '@nestjs/graphql';
import { RSVPStatus } from '../enums/graphql-enums';
import { Event } from './event.entity';
import { Member } from '../../members/entities/member.entity';

@ObjectType()
export class EventRegistration {
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

  // Guest registration fields (for non-members)
  @Field(() => String, { nullable: true })
  guestName?: string | null;

  @Field(() => String, { nullable: true })
  guestEmail?: string | null;

  @Field(() => String, { nullable: true })
  guestPhone?: string | null;

  // Registration details
  @Field(() => GraphQLISODateTime)
  registrationDate: Date;

  @Field(() => RSVPStatus)
  status: RSVPStatus;

  @Field(() => Int)
  numberOfGuests: number;

  @Field(() => String, { nullable: true })
  specialRequests?: string | null;

  // Payment info (for paid events)
  @Field(() => Float, { nullable: true })
  amountPaid?: number | null;

  @Field(() => String, { nullable: true })
  paymentStatus?: string | null;

  @Field(() => String, { nullable: true })
  paymentMethod?: string | null;

  @Field(() => String, { nullable: true })
  transactionId?: string | null;

  // Approval workflow
  @Field(() => String, { nullable: true })
  approvalStatus?: string | null;

  @Field(() => String, { nullable: true })
  approvedBy?: string | null;

  @Field(() => GraphQLISODateTime, { nullable: true })
  approvedAt?: Date | null;

  @Field(() => String, { nullable: true })
  rejectionReason?: string | null;

  // Metadata
  @Field(() => String, { nullable: true })
  registrationSource?: string | null;

  @Field(() => String, { nullable: true })
  notes?: string | null;

  @Field(() => String, { nullable: true })
  createdBy?: string | null;

  @Field(() => String, { nullable: true })
  updatedBy?: string | null;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;
}
