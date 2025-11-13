import { InputType, Field, ID } from '@nestjs/graphql';
import { IsString, IsOptional, IsBoolean, IsInt, IsArray, IsDateString } from 'class-validator';

@InputType()
export class CreateBroadcastInput {
  @Field()
  @IsString()
  title: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field()
  @IsDateString()
  scheduledStartTime: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  scheduledEndTime?: string;

  @Field(() => [String])
  @IsArray()
  platforms: string[]; // ['ZOOM', 'FACEBOOK', 'INSTAGRAM']

  @Field({ nullable: true, defaultValue: true })
  @IsOptional()
  @IsBoolean()
  isRecorded?: boolean;

  @Field({ nullable: true, defaultValue: true })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsInt()
  maxAttendees?: number;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  branchId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  thumbnailUrl?: string;
}
