import { Field, InputType } from '@nestjs/graphql';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { ContentStatus } from '../enums/content-status.enum';

@InputType()
export class CreateSermonInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  title: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field()
  @IsNotEmpty()
  @IsDateString()
  datePreached: string;

  @Field()
  @IsNotEmpty()
  @IsUUID()
  speakerId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  seriesId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  mainScripture?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  audioUrl?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  videoUrl?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  transcriptUrl?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  transcriptText?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  duration?: number;

  @Field()
  @IsNotEmpty()
  @IsUUID()
  branchId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;
}
