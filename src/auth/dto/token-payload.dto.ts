import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class TokenPayloadDto {
  @Field(() => String)
  accessToken: string;

  @Field(() => String)
  refreshToken: string;
}
