import { InputType, Field, ID } from '@nestjs/graphql';
import { GraphQLISODateTime } from '@nestjs/graphql';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { BurialType } from '../entities/death-register.entity';

@InputType()
export class CreateDeathRegisterInput {
  @Field(() => ID)
  @IsString()
  memberId: string;

  @Field(() => String)
  @IsString()
  dateOfDeath: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  timeOfDeath?: string;

  @Field(() => String)
  @IsString()
  placeOfDeath: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  causeOfDeath?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  circumstances?: string;

  // Funeral Information
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  funeralDate?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  funeralLocation?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  funeralOfficiant?: string;

  @Field(() => BurialType)
  @IsEnum(BurialType)
  burialCremation: BurialType;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  cemeteryLocation?: string;

  // Family & Contacts
  @Field(() => String)
  @IsString()
  nextOfKin: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  nextOfKinPhone?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  nextOfKinEmail?: string;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  familyNotified?: boolean;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  notificationDate?: string;

  // Documentation
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  deathCertificateUrl?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  obituaryUrl?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photoUrls?: string[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  additionalDocuments?: string[];

  // Foreign Keys
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  branchId?: string;

  @Field(() => ID)
  @IsString()
  organisationId: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  funeralEventId?: string;
}

@InputType()
export class UpdateDeathRegisterInput {
  @Field(() => ID)
  @IsString()
  id: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  memberId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  dateOfDeath?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  timeOfDeath?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  placeOfDeath?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  causeOfDeath?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  circumstances?: string;

  // Funeral Information
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  funeralDate?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  funeralLocation?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  funeralOfficiant?: string;

  @Field(() => BurialType, { nullable: true })
  @IsOptional()
  @IsEnum(BurialType)
  burialCremation?: BurialType;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  cemeteryLocation?: string;

  // Family & Contacts
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  nextOfKin?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  nextOfKinPhone?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  nextOfKinEmail?: string;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  familyNotified?: boolean;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  notificationDate?: string;

  // Documentation
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  deathCertificateUrl?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  obituaryUrl?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photoUrls?: string[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  additionalDocuments?: string[];

  // Foreign Keys
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  branchId?: string;

  @Field(() => ID)
  @IsString()
  organisationId: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  funeralEventId?: string;
}

@InputType()
export class DeathRegisterFilterInput {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  organisationId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  branchId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  dateFrom?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  dateTo?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  searchTerm?: string;

  @Field(() => BurialType, { nullable: true })
  @IsOptional()
  @IsEnum(BurialType)
  burialType?: BurialType;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  familyNotified?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  hasFuneralEvent?: boolean;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  recordedBy?: string;

  @Field(() => Number, { nullable: true })
  @IsOptional()
  skip?: number;

  @Field(() => Number, { nullable: true })
  @IsOptional()
  take?: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';
}

@InputType()
export class UploadDeathDocumentInput {
  @Field(() => ID)
  @IsString()
  deathRegisterId: string;

  @Field(() => String)
  @IsString()
  documentUrl: string;

  @Field(() => String)
  @IsString()
  documentType: 'DEATH_CERTIFICATE' | 'OBITUARY' | 'PHOTO' | 'OTHER';

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  description?: string;
}
