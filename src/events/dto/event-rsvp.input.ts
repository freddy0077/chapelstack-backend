import { InputType, Field, Int } from '@nestjs/graphql';
import {
  IsOptional,
  IsString,
  IsEmail,
  IsInt,
  Min,
  IsEnum,
} from 'class-validator';
import { RSVPStatus } from '@prisma/client';

@InputType()
export class CreateEventRSVPInput {
  @Field()
  @IsString()
  eventId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  memberId?: string;

  // Guest RSVP fields (for non-members)
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  guestName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  guestEmail?: string;

  @Field(() => RSVPStatus, { defaultValue: RSVPStatus.PENDING })
  @IsOptional()
  @IsEnum(RSVPStatus)
  status?: RSVPStatus;

  @Field(() => Int, { defaultValue: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  numberOfGuests?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  message?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  rsvpSource?: string;
}

@InputType()
export class UpdateEventRSVPInput {
  @Field()
  @IsString()
  id: string;

  @Field(() => RSVPStatus, { nullable: true })
  @IsOptional()
  @IsEnum(RSVPStatus)
  status?: RSVPStatus;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  numberOfGuests?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  message?: string;
}

@InputType()
export class EventRSVPFilterInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  eventId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  memberId?: string;

  @Field(() => RSVPStatus, { nullable: true })
  @IsOptional()
  @IsEnum(RSVPStatus)
  status?: RSVPStatus;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  organisationId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  branchId?: string;
}
