import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class ConnectPlatformInput {
  @Field()
  platform: string;

  @Field()
  accessToken: string;

  @Field({ nullable: true })
  refreshToken?: string;

  @Field({ nullable: true })
  platformUserId?: string;

  @Field({ nullable: true })
  platformUserName?: string;

  @Field({ nullable: true })
  tokenExpiresAt?: Date;
}
