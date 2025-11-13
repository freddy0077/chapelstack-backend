import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class EmailSettingsEntity {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  branchId: string;

  @Field(() => Boolean)
  isActive: boolean;

  @Field({ nullable: true })
  smtpHost?: string;

  @Field({ nullable: true })
  smtpPort?: number;

  @Field({ nullable: true })
  smtpUsername?: string;

  // Note: Password is never returned via GraphQL
  // @Field({ nullable: true })
  // smtpPassword?: string;

  @Field({ nullable: true })
  smtpEncryption?: string;

  @Field({ nullable: true })
  fromEmail?: string;

  @Field({ nullable: true })
  fromName?: string;

  @Field({ nullable: true })
  replyToEmail?: string;

  @Field({ nullable: true })
  lastTested?: Date;

  @Field({ nullable: true })
  testResult?: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}
