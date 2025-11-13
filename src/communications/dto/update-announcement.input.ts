import { Field, InputType } from '@nestjs/graphql';
import { IsString, IsOptional, IsBoolean, IsArray, IsDateString } from 'class-validator';

@InputType()
export class UpdateAnnouncementInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  title?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  content?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  category?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  priority?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  targetAudience?: string;

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

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  sendEmail?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  sendPush?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  displayOnBoard?: boolean;

  @Field({ nullable: true })
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
