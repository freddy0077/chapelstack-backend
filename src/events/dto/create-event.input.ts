import { InputType, Field, registerEnumType } from '@nestjs/graphql';
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
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

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
          console.log(`IsOptionalDate validator - Field: ${args.property}, Value:`, JSON.stringify(value), `Type: ${typeof value}`);
          
          // Allow undefined, null, empty string, or whitespace-only strings
          if (value === undefined || value === null || value === '' || 
              (typeof value === 'string' && value.trim() === '')) {
            console.log(`IsOptionalDate validator - Allowing empty value for ${args.property}`);
            return true;
          }
          
          // For non-empty values, check if it's a valid date
          try {
            const date = new Date(value);
            const isValid = !isNaN(date.getTime());
            console.log(`IsOptionalDate validator - Date validation for ${args.property}:`, isValid);
            return isValid;
          } catch (error) {
            console.log(`IsOptionalDate validator - Error parsing date for ${args.property}:`, error);
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
}
