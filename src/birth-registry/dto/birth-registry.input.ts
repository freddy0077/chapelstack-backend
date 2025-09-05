import { InputType, Field, ID } from '@nestjs/graphql';
import { GraphQLISODateTime } from '@nestjs/graphql';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  IsEnum,
  IsDateString,
  IsNumber,
  IsEmail,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Gender } from '../../common/enums/gender.enum';

@InputType()
export class AdditionalDocumentInput {
  @Field(() => String)
  @IsString()
  name: string;

  @Field(() => String)
  @IsString()
  url: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  type?: string;
}

@InputType()
export class CreateBirthRegistryInput {
  // Child Information
  @Field(() => String)
  @IsString()
  childFirstName: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  childMiddleName?: string;

  @Field(() => String)
  @IsString()
  childLastName: string;

  @Field(() => Gender)
  @IsEnum(Gender)
  childGender: Gender;

  @Field(() => String)
  @IsDateString()
  dateOfBirth: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  timeOfBirth?: string;

  @Field(() => String)
  @IsString()
  placeOfBirth: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  hospitalName?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  attendingPhysician?: string;

  @Field(() => Number, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10000)
  birthWeight?: number;

  @Field(() => Number, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  birthLength?: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  birthCircumstances?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  complications?: string;

  // Mother Information
  @Field(() => String)
  @IsString()
  motherFirstName: string;

  @Field(() => String)
  @IsString()
  motherLastName: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  motherMemberId?: string;

  @Field(() => Number, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(10)
  @Max(100)
  motherAge?: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  motherOccupation?: string;

  // Father Information
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  fatherFirstName?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  fatherLastName?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  fatherMemberId?: string;

  @Field(() => Number, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(10)
  @Max(100)
  fatherAge?: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  fatherOccupation?: string;

  // Parent Contact Information
  @Field(() => String)
  @IsString()
  parentAddress: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  parentPhone?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsEmail()
  parentEmail?: string;

  // Baptism Planning
  @Field(() => Boolean)
  @IsBoolean()
  baptismPlanned: boolean;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsDateString()
  baptismDate?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  baptismLocation?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  baptismOfficiant?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  baptismEventId?: string;

  // Child Member Creation
  @Field(() => Boolean, { defaultValue: true })
  @IsBoolean()
  createChildMember: boolean;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  childMemberId?: string;

  // Documentation
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  birthCertificateUrl?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  hospitalRecordUrl?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photoUrls?: string[];

  @Field(() => [AdditionalDocumentInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AdditionalDocumentInput)
  additionalDocuments?: AdditionalDocumentInput[];

  // Foreign Keys
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  branchId?: string;

  @Field(() => ID)
  @IsString()
  organisationId: string;
}

@InputType()
export class UpdateBirthRegistryInput {
  // Child Information
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  childFirstName?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  childMiddleName?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  childLastName?: string;

  @Field(() => Gender, { nullable: true })
  @IsOptional()
  @IsEnum(Gender)
  childGender?: Gender;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  timeOfBirth?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  placeOfBirth?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  hospitalName?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  attendingPhysician?: string;

  @Field(() => Number, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10000)
  birthWeight?: number;

  @Field(() => Number, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  birthLength?: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  birthCircumstances?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  complications?: string;

  // Mother Information
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  motherFirstName?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  motherLastName?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  motherMemberId?: string;

  @Field(() => Number, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(10)
  @Max(100)
  motherAge?: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  motherOccupation?: string;

  // Father Information
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  fatherFirstName?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  fatherLastName?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  fatherMemberId?: string;

  @Field(() => Number, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(10)
  @Max(100)
  fatherAge?: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  fatherOccupation?: string;

  // Parent Contact Information
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  parentAddress?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  parentPhone?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsEmail()
  parentEmail?: string;

  // Baptism Planning
  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  baptismPlanned?: boolean;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsDateString()
  baptismDate?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  baptismLocation?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  baptismOfficiant?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  baptismEventId?: string;

  // Child Member Creation
  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  createChildMember?: boolean;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  childMemberId?: string;

  // Documentation
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  birthCertificateUrl?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  hospitalRecordUrl?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photoUrls?: string[];

  @Field(() => [AdditionalDocumentInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AdditionalDocumentInput)
  additionalDocuments?: AdditionalDocumentInput[];
}

@InputType()
export class BirthRegistryFiltersInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  search?: string;

  @Field(() => Gender, { nullable: true })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  baptismPlanned?: boolean;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  placeOfBirth?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  branchId?: string;

  @Field(() => Number, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  skip?: number;

  @Field(() => Number, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  take?: number;
}

@InputType()
export class UploadDocumentInput {
  @Field(() => ID)
  @IsString()
  birthRegistryId: string;

  @Field(() => String)
  @IsString()
  documentType: string;

  @Field(() => String)
  @IsString()
  documentUrl: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  documentName?: string;
}
