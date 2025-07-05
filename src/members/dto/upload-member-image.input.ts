import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class UploadMemberImageInput {
  @Field(() => String)
  memberId: string;

  @Field(() => String)
  fileName: string;

  @Field(() => String)
  contentType: string;
}
