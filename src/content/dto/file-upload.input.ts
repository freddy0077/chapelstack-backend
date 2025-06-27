import { Field, InputType } from '@nestjs/graphql';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { MediaType } from '../enums/media-type.enum';

@InputType()
export class FileUploadInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  fileName: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  contentType: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsEnum(MediaType, {
    message:
      'mediaType must be a valid MediaType: AUDIO_FILE, VIDEO, IMAGE, DOCUMENT_PDF, DOCUMENT_WORD, SLIDESHOW, OTHER',
  })
  mediaType: MediaType;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field()
  @IsNotEmpty()
  @IsUUID()
  branchId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  directory?: string;
}
