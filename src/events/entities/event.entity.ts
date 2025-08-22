import { ObjectType, Field, ID, Int, Float } from '@nestjs/graphql';
import { GraphQLISODateTime } from '@nestjs/graphql';
import { EventType, EventStatus } from '../enums/graphql-enums';
import { Branch } from '../../branches/entities/branch.entity';
import { User } from '../../users/entities/user.entity';
import { AttendanceRecord } from '../../attendance/entities/attendance-record.entity';
import { EventRegistration } from './event-registration.entity';
import { EventRSVP } from './event-rsvp.entity';

@ObjectType()
export class Event {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => GraphQLISODateTime)
  startDate: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  endDate?: Date;

  @Field(() => String, { nullable: true })
  location?: string;

  @Field(() => String, { nullable: true })
  category?: string;

  // New event enhancement fields
  @Field(() => EventType)
  eventType: EventType;

  @Field(() => EventStatus)
  status: EventStatus;

  @Field(() => Int, { nullable: true })
  capacity?: number | null;

  @Field()
  registrationRequired: boolean;

  @Field(() => GraphQLISODateTime, { nullable: true })
  registrationDeadline?: Date | null;

  @Field()
  isPublic: boolean;

  @Field()
  requiresApproval: boolean;

  @Field(() => String, { nullable: true })
  eventImageUrl?: string | null;

  @Field(() => [String], { nullable: true })
  tags?: string[] | null;

  // Contact and organizer info
  @Field(() => String, { nullable: true })
  organizerName?: string | null;

  @Field(() => String, { nullable: true })
  organizerEmail?: string | null;

  @Field(() => String, { nullable: true })
  organizerPhone?: string | null;

  // Pricing (for paid events)
  @Field()
  isFree: boolean;

  @Field(() => Float, { nullable: true })
  ticketPrice?: number | null;

  @Field(() => String, { nullable: true })
  currency?: string | null;

  // Post-event notes fields
  @Field(() => String, { nullable: true })
  postEventNotes?: string | null;

  @Field(() => String, { nullable: true })
  postEventNotesBy?: string | null;

  @Field(() => GraphQLISODateTime, { nullable: true })
  postEventNotesDate?: Date | null;

  @Field(() => User, { nullable: true })
  postEventNotesAuthor?: User | null;

  // Existing fields
  @Field(() => String, { nullable: true })
  branchId?: string | null;

  @Field(() => String, { nullable: true })
  organisationId?: string | null;

  @Field(() => String, { nullable: true })
  createdBy?: string | null;

  @Field(() => String, { nullable: true })
  updatedBy?: string | null;

  @Field(() => Branch, { nullable: true })
  branch?: Branch;

  @Field(() => [User], { nullable: true })
  attendees?: User[];

  @Field(() => User, { nullable: true })
  creator?: User;

  // Enhanced relationships
  @Field(() => [EventRegistration], { nullable: true })
  eventRegistrations?: EventRegistration[];

  @Field(() => [EventRSVP], { nullable: true })
  eventRSVPs?: EventRSVP[];

  @Field(() => [AttendanceRecord], { nullable: true })
  attendanceRecords?: AttendanceRecord[];

  @Field(() => GraphQLISODateTime, { nullable: true })
  createdAt?: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  updatedAt?: Date;
}
