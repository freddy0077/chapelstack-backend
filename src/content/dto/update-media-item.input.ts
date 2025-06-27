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
export class UpdateMediaItemInput {
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
  @IsString()
  fileUrl?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  mimeType?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  fileSize?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsEnum(MediaType)
  type?: MediaType;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  branchId?: string;
}
