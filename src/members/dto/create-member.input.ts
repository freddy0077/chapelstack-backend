import { InputType, Field, ID } from '@nestjs/graphql';
import {
  IsEmail,
  IsOptional,
  IsNotEmpty,
  IsDate,
  IsString,
  IsUUID,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { GraphQLJSON } from 'graphql-type-json';
import { GraphQLISODateTime } from '@nestjs/graphql';
import { IsValidEnum } from '../../common/utils/enum-validation.util';
import { Gender } from '../../common/enums/gender.enum';
import {
  MaritalStatus,
  MemberStatus,
  MembershipStatus,
  MembershipType,
  PrivacyLevel,
} from '../entities/member.entity';

@InputType()
export class CreateMemberInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  middleName?: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  preferredName?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsEmail()
  email?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsEmail()
  alternativeEmail?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  alternatePhone?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  rfidCardId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  nfcId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  address?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  addressLine2?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  city?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  state?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  postalCode?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  country?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  district?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  region?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  digitalAddress?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  landmark?: string;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dateOfBirth?: Date;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  placeOfBirth?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  nationality?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  title?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  nlbNumber?: string;

  @Field(() => Gender, { defaultValue: Gender.UNKNOWN })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @Field(() => MaritalStatus, { defaultValue: MaritalStatus.UNKNOWN })
  @IsOptional()
  @IsEnum(MaritalStatus)
  maritalStatus?: MaritalStatus;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  occupation?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  employerName?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  education?: string;

  @Field(() => MemberStatus, { defaultValue: MemberStatus.ACTIVE })
  @IsOptional()
  @IsEnum(MemberStatus)
  status?: MemberStatus;

  @Field(() => MembershipStatus, { defaultValue: MembershipStatus.VISITOR })
  @IsOptional()
  @IsEnum(MembershipStatus)
  membershipStatus?: MembershipStatus;

  @Field(() => MembershipType, { defaultValue: MembershipType.REGULAR })
  @IsOptional()
  @IsEnum(MembershipType)
  membershipType?: MembershipType;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  membershipDate?: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  baptismDate?: Date;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  baptismLocation?: string;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  confirmationDate?: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  salvationDate?: Date;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  statusChangeReason?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  profileImageUrl?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  customFields?: any;

  @Field(() => PrivacyLevel, { defaultValue: PrivacyLevel.STANDARD })
  @IsOptional()
  @IsEnum(PrivacyLevel)
  privacyLevel?: PrivacyLevel;

  @Field(() => String, { defaultValue: 'en' })
  @IsOptional()
  @IsString()
  preferredLanguage?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  organisationId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  spouseId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  familyId?: string;

  @Field(() => Boolean, { defaultValue: false })
  @IsOptional()
  @IsBoolean()
  headOfHousehold?: boolean;

  @Field(() => Boolean, { defaultValue: false })
  @IsOptional()
  @IsBoolean()
  isRegularAttendee?: boolean;

  // Family Info
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  fatherName?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  motherName?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  fatherOccupation?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  motherOccupation?: string;

  // Emergency Contact
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  emergencyContactName?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  emergencyContactPhone?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  emergencyContactRelation?: string;

  // GDPR Compliance
  @Field(() => GraphQLISODateTime, { nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  consentDate?: Date;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  consentVersion?: string;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dataRetentionDate?: Date;

  // Special Gifts and Group Memberships
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  specialGifts?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsUUID('4', { each: true })
  groupIds?: string[];
}
