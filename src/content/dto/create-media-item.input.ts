import { Field, InputType } from '@nestjs/graphql';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { MediaType } from '../enums/media-type.enum';

@InputType()
export class CreateMediaItemInput {
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
  @IsString()
  fileUrl: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  mimeType: string;

  @Field()
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  fileSize: number;

  @Field()
  @IsNotEmpty()
  @IsEnum(MediaType)
  type: MediaType;

  @Field()
  @IsNotEmpty()
  @IsUUID()
  branchId: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  uploadedBy: string;
}
