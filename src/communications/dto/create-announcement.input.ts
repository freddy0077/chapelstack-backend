import { Field, InputType } from '@nestjs/graphql';
import { IsString, IsOptional, IsBoolean, IsArray, IsDateString, IsEnum } from 'class-validator';

enum AnnouncementCategory {
  GENERAL = 'General',
  EVENT = 'Event',
  URGENT = 'Urgent',
  MAINTENANCE = 'Maintenance',
}

enum AnnouncementPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical',
}

enum TargetAudience {
  ALL = 'ALL',
  STAFF_ONLY = 'STAFF_ONLY',
  SPECIFIC_GROUPS = 'SPECIFIC_GROUPS',
}

@InputType()
export class CreateAnnouncementInput {
  @Field()
  @IsString()
  title: string;

  @Field()
  @IsString()
  content: string;

  @Field()
  @IsString()
  category: string;

  @Field()
  @IsString()
  priority: string;

  @Field()
  @IsString()
  targetAudience: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  targetGroupIds?: string[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  attachmentUrl?: string;

  @Field({ nullable: true, defaultValue: true })
  @IsOptional()
  @IsBoolean()
  sendEmail?: boolean;

  @Field({ nullable: true, defaultValue: true })
  @IsOptional()
  @IsBoolean()
  sendPush?: boolean;

  @Field({ nullable: true, defaultValue: true })
  @IsOptional()
  @IsBoolean()
  displayOnBoard?: boolean;

  @Field({ nullable: true, defaultValue: true })
  @IsOptional()
  @IsBoolean()
  displayOnDashboard?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  scheduledFor?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  expiresAt?: Date;
}
