import { ObjectType, Field, ID } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';

@ObjectType()
export class MobileAppSettingsEntity {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  branchId: string;

  @Field({ nullable: true })
  appName?: string;

  @Field({ nullable: true })
  appIconUrl?: string;

  @Field({ nullable: true })
  splashScreenUrl?: string;

  @Field({ nullable: true })
  primaryColor?: string;

  @Field({ nullable: true })
  secondaryColor?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  firebaseConfig?: any;

  @Field(() => GraphQLJSON, { nullable: true })
  notificationPrefs?: any;

  @Field(() => [String], { nullable: true })
  enabledFeatures?: string[];

  @Field({ nullable: true })
  deepLinkDomain?: string;

  @Field({ nullable: true })
  appStoreUrl?: string;

  @Field({ nullable: true })
  playStoreUrl?: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}
