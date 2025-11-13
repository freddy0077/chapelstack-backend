import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsOptional, IsBoolean, IsInt, IsDateString } from 'class-validator';

@InputType()
export class UpdateBroadcastInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  title?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  scheduledStartTime?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  scheduledEndTime?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isRecorded?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsInt()
  maxAttendees?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  thumbnailUrl?: string;
}
