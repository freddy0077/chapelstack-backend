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
export class UpdateSermonInput {
  @Field()
  @IsNotEmpty()
  @IsUUID()
  id: string;

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
  datePreached?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  speakerId?: string;

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

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  tags?: string[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notesUrl?: string;
}
