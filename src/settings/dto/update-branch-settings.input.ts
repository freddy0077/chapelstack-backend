import { InputType, Field } from '@nestjs/graphql';
import { IsOptional, IsString, IsUrl, IsEnum } from 'class-validator';

@InputType()
export class UpdateBranchSettingsInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  branchName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  contactEmail?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  contactPhone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  address?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  city?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  state?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  country?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  postalCode?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  timezone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  language?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  dateFormat?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  timeFormat?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  weekStartDay?: string;
}

@InputType()
export class UpdateBrandingInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl()
  secondaryLogoUrl?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl()
  faviconUrl?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  primaryColor?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  secondaryColor?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  accentColor?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  textColorLight?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  textColorDark?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  backgroundColor?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEnum(['light', 'dark', 'auto'])
  theme?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  customCss?: string;
}

@InputType()
export class UpdateCurrencyInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  currency?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  currencySymbol?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEnum(['before', 'after'])
  currencyPosition?: string;

  @Field({ nullable: true })
  @IsOptional()
  decimalPlaces?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  thousandSeparator?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  decimalSeparator?: string;
}

@InputType()
export class UpdateAttendanceTypeInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsEnum(['MANUAL', 'QR_CODE', 'NFC', 'BIOMETRIC'])
  attendanceType?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  attendanceMethods?: string[];
}
