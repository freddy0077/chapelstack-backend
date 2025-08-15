import { InputType, Field, ID } from '@nestjs/graphql';
import { IsOptional, IsBoolean, IsString, IsArray } from 'class-validator';

@InputType()
export class CreateCommunicationPrefsInput {
  @Field(() => ID)
  memberId: string;

  @Field(() => Boolean, { defaultValue: true })
  @IsOptional()
  @IsBoolean()
  emailEnabled?: boolean;

  @Field(() => Boolean, { defaultValue: true })
  @IsOptional()
  @IsBoolean()
  emailNewsletter?: boolean;

  @Field(() => Boolean, { defaultValue: true })
  @IsOptional()
  @IsBoolean()
  emailEvents?: boolean;

  @Field(() => Boolean, { defaultValue: true })
  @IsOptional()
  @IsBoolean()
  emailReminders?: boolean;

  @Field(() => Boolean, { defaultValue: true })
  @IsOptional()
  @IsBoolean()
  emailPrayer?: boolean;

  @Field(() => Boolean, { defaultValue: false })
  @IsOptional()
  @IsBoolean()
  smsEnabled?: boolean;

  @Field(() => Boolean, { defaultValue: false })
  @IsOptional()
  @IsBoolean()
  smsEvents?: boolean;

  @Field(() => Boolean, { defaultValue: false })
  @IsOptional()
  @IsBoolean()
  smsReminders?: boolean;

  @Field(() => Boolean, { defaultValue: true })
  @IsOptional()
  @IsBoolean()
  smsEmergency?: boolean;

  @Field(() => Boolean, { defaultValue: true })
  @IsOptional()
  @IsBoolean()
  phoneCallsEnabled?: boolean;

  @Field(() => Boolean, { defaultValue: true })
  @IsOptional()
  @IsBoolean()
  phoneEmergency?: boolean;

  @Field(() => Boolean, { defaultValue: true })
  @IsOptional()
  @IsBoolean()
  physicalMail?: boolean;

  @Field(() => Boolean, { defaultValue: true })
  @IsOptional()
  @IsBoolean()
  pushNotifications?: boolean;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  preferredCallTime?: string;

  @Field(() => [String], { defaultValue: [] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  doNotDisturbDays?: string[];
}

@InputType()
export class UpdateCommunicationPrefsInput {
  @Field(() => ID)
  id: string;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  emailEnabled?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  emailNewsletter?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  emailEvents?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  emailReminders?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  emailPrayer?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  smsEnabled?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  smsEvents?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  smsReminders?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  smsEmergency?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  phoneCallsEnabled?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  phoneEmergency?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  physicalMail?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  pushNotifications?: boolean;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  preferredCallTime?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  doNotDisturbDays?: string[];
}
