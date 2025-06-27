import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class FileUploadResponse {
  @Field()
  uploadUrl: string;

  @Field()
  fileUrl: string;

  @Field({ nullable: true })
  mediaItemId?: string;
}
