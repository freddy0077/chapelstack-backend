import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class ConnectedPlatformEntity {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  platform: string;

  @Field(() => String, { nullable: true })
  platformUserId?: string;

  @Field(() => String, { nullable: true })
  platformUserName?: string;

  @Field(() => Date, { nullable: true })
  tokenExpiresAt?: Date;

  @Field(() => Boolean)
  isActive: boolean;

  @Field(() => Boolean)
  isExpired: boolean;

  @Field(() => Date)
  createdAt: Date;
}
