import { InputType, Field, ID } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsArray,
  IsUUID,
  ValidateNested,
  IsOptional,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { RecordAttendanceInput } from './record-attendance.input';

@InputType()
export class RecordBulkAttendanceInput {
  // Flexible attendance linking - can link to either session OR event
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  sessionId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  eventId?: string;

  @Field(() => [RecordAttendanceInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecordAttendanceInput)
  attendanceRecords?: RecordAttendanceInput[];

  @Field({ nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  headcount?: number;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  recordedById?: string;
}
