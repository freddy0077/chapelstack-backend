import { ObjectType, Field, ID, Int } from '@nestjs/graphql';;
import { MediaType } from '../enums/media-type.enum';

@ObjectType('MediaItem')
export class MediaItemEntity {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  title: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => String)
  fileUrl: string;

  @Field(() => String)
  mimeType: string;

  @Field(() => Int)
  fileSize: number;

  @Field(() => MediaType)
  type: MediaType;

  @Field(() => String)
  branchId: string;
}
