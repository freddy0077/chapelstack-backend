import { ObjectType, Field, ID } from '@nestjs/graphql';
import { MediaType } from '../enums/media-type.enum';

@ObjectType('MediaItem')
export class MediaItemEntity {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  fileUrl: string;

  @Field()
  mimeType: string;

  @Field()
  fileSize: number;

  @Field(() => MediaType)
  type: MediaType;

  @Field()
  branchId: string;
}
