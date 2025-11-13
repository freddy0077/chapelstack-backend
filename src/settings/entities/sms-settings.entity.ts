import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class SmsSettingsEntity {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  branchId: string;

  @Field(() => Boolean)
  isActive: boolean;

  @Field({ nullable: true })
  provider?: string;

  // Note: API keys/secrets are never returned via GraphQL
  // @Field({ nullable: true })
  // apiKey?: string;
  
  // @Field({ nullable: true })
  // apiSecret?: string;

  @Field({ nullable: true })
  senderId?: string;

  @Field({ nullable: true })
  webhookUrl?: string;

  @Field({ nullable: true })
  lastTested?: Date;

  @Field({ nullable: true })
  testResult?: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}
