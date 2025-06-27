import { ObjectType, Field, ID } from '@nestjs/graphql';
import { GraphQLISODateTime } from '@nestjs/graphql';

@ObjectType()
export class QRCodeToken {
  @Field(() => ID)
  id: string;

  @Field()
  token: string;

  @Field()
  sessionId: string;

  @Field(() => GraphQLISODateTime)
  expiresAt: Date;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;
}
