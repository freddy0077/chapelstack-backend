import { Field, ID, InputType } from '@nestjs/graphql';
import {
  IsBoolean,
  IsEnum,
  IsJSON,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export enum VisibilityLevel {
  FULL = 'full',
  LIMITED = 'limited',
  NONE = 'none',
}

export enum ReportingLevel {
  DETAILED = 'detailed',
  SUMMARY = 'summary',
  NONE = 'none',
}

@InputType()
export class BrandingSettingsInput {
  @Field()
  @IsString()
  primaryColor: string;

  @Field()
  @IsString()
  secondaryColor: string;

  @Field()
  @IsString()
  fontFamily: string;
}

@InputType()
export class NotificationSettingsInput {
  @Field(() => Boolean)
  @IsBoolean()
  emailNotifications: boolean;

  @Field(() => Boolean)
  @IsBoolean()
  smsNotifications: boolean;

  @Field(() => Boolean)
  @IsBoolean()
  transferNotifications: boolean;

  @Field(() => Boolean)
  @IsBoolean()
  financialNotifications: boolean;
}

@InputType()
export class UpdateBranchSettingsInput {
  @Field(() => ID)
  @IsUUID()
  @IsNotEmpty()
  branchId: string;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  allowMemberTransfers?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  allowResourceSharing?: boolean;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsEnum(VisibilityLevel)
  visibilityToOtherBranches?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsEnum(ReportingLevel)
  financialReportingLevel?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsEnum(ReportingLevel)
  attendanceReportingLevel?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsEnum(VisibilityLevel)
  memberDataVisibility?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  timezone?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  currency?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  language?: string;

  @Field(() => BrandingSettingsInput, { nullable: true })
  @IsOptional()
  brandingSettings?: Record<string, any>;

  @Field(() => NotificationSettingsInput, { nullable: true })
  @IsOptional()
  notificationSettings?: Record<string, any>;
}
