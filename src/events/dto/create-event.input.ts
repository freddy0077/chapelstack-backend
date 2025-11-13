import { InputType, Field, registerEnumType, Int } from '@nestjs/graphql';
import { GraphQLISODateTime } from '@nestjs/graphql';
import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsDate,
  IsBoolean,
  IsEnum,
  IsInt,
  Min,
  IsUUID,
  IsArray,
  ValidateIf,
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  IsEmail,
  IsNumber,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { EventType, EventStatus } from '@prisma/client';

// Register RecurrenceType enum for GraphQL
export enum RecurrenceType {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

registerEnumType(RecurrenceType, {
  name: 'RecurrenceType',
  description: 'Type of event recurrence',
});

// Register EventType enum for GraphQL
registerEnumType(EventType, {
  name: 'EventType',
  description: 'Type of event with corresponding icons',
});

// Register EventStatus enum for GraphQL
registerEnumType(EventStatus, {
  name: 'EventStatus',
  description: 'Status of the event',
});

// Custom validator for optional date that handles empty strings
function IsOptionalDate(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isOptionalDate',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          console.log(
            `IsOptionalDate validator - Field: ${args.property}, Value:`,
            JSON.stringify(value),
            `Type: ${typeof value}`,
          );

          // Allow undefined, null, empty string, or whitespace-only strings
          if (
            value === undefined ||
            value === null ||
            value === '' ||
            (typeof value === 'string' && value.trim() === '')
          ) {
            console.log(
              `IsOptionalDate validator - Allowing empty value for ${args.property}`,
            );
            return true;
          }

          // For non-empty values, check if it's a valid date
          try {
            const date = new Date(value);
            const isValid = !isNaN(date.getTime());
            console.log(
              `IsOptionalDate validator - Date validation for ${args.property}:`,
              isValid,
            );
            return isValid;
          } catch (error) {
            console.log(
              `IsOptionalDate validator - Error parsing date for ${args.property}:`,
              error,
            );
            return false;
          }
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid date or empty`;
        },
      },
    });
  };
}

@InputType()
export class CreateEventInput {
  @Field()
  @IsNotEmpty({ message: 'Title is required' })
  @IsString()
  title: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => GraphQLISODateTime)
  @IsNotEmpty({ message: 'Start date is required' })
  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @IsOptional()
  @Type(() => Date)
  @IsOptionalDate()
  endDate?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  location?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  category?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  organisationId?: string;

  // Recurring event fields
  @Field({ nullable: true, defaultValue: false })
  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @Field(() => RecurrenceType, { nullable: true })
  @IsOptional()
  @IsEnum(RecurrenceType)
  recurrenceType?: RecurrenceType;

  @Field({ nullable: true, defaultValue: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  recurrenceInterval?: number;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @IsOptional()
  recurrenceEndDate?: Date;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  recurrenceDaysOfWeek?: string[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  recurrencePattern?: string;

  // New event enhancement fields
  @Field(() => EventType, { defaultValue: EventType.OTHER })
  @IsOptional()
  @IsEnum(EventType)
  eventType?: EventType;

  @Field(() => EventStatus, { defaultValue: EventStatus.DRAFT })
  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;

  @Field({ defaultValue: false })
  @IsOptional()
  @IsBoolean()
  registrationRequired?: boolean;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @IsOptional()
  @Type(() => Date)
  @IsOptionalDate()
  registrationDeadline?: Date;

  @Field({ defaultValue: true })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @Field({ defaultValue: false })
  @IsOptional()
  @IsBoolean()
  requiresApproval?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  eventImageUrl?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  tags?: string[];

  // Contact and organizer info
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  organizerName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  organizerEmail?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  organizerPhone?: string;

  // Pricing (for paid events)
  @Field({ defaultValue: true })
  @IsOptional()
  @IsBoolean()
  isFree?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  ticketPrice?: number;

  @Field({ nullable: true, defaultValue: 'GHS' })
  @IsOptional()
  @IsString()
  currency?: string;
}
