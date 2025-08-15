import { InputType, Field, Int } from '@nestjs/graphql';
import {
  IsOptional,
  IsString,
  IsEmail,
  IsInt,
  Min,
  IsEnum,
  IsDecimal,
} from 'class-validator';
import { RSVPStatus } from '@prisma/client';

@InputType()
export class CreateEventRegistrationInput {
  @Field()
  @IsString()
  eventId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  memberId?: string;

  // Guest registration fields (for non-members)
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  guestName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  guestEmail?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  guestPhone?: string;

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
  specialRequests?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDecimal()
  amountPaid?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  paymentStatus?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  transactionId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  registrationSource?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;
}

@InputType()
export class UpdateEventRegistrationInput {
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
  specialRequests?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDecimal()
  amountPaid?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  paymentStatus?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  transactionId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  approvalStatus?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  approvedBy?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  rejectionReason?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;
}

@InputType()
export class EventRegistrationFilterInput {
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
  paymentStatus?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  approvalStatus?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  organisationId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  branchId?: string;
}
