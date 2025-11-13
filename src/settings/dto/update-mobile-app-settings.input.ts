import { InputType, Field } from '@nestjs/graphql';
import { IsOptional, IsString, IsUrl } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

@InputType()
export class UpdateMobileAppSettingsInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  appName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl()
  appIconUrl?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl()
  splashScreenUrl?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  primaryColor?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  secondaryColor?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  firebaseConfig?: any;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  notificationPrefs?: any;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  enabledFeatures?: string[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  deepLinkDomain?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl()
  appStoreUrl?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl()
  playStoreUrl?: string;
}

@InputType()
export class UpdateAppBrandingInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  appName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl()
  appIconUrl?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl()
  splashScreenUrl?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  primaryColor?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  secondaryColor?: string;
}

@InputType()
export class ToggleFeatureInput {
  @Field()
  @IsString()
  feature: string;

  @Field()
  enabled: boolean;
}
