import { InputType, Field, ID } from '@nestjs/graphql';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEmail,
  IsNumber,
  IsDate,
  IsUUID,
} from 'class-validator';
import { LicenseType, LicenseStatus } from '../entities/license.entity';
import { GraphQLJSON } from 'graphql-type-json';
import { Type } from 'class-transformer';

@InputType()
export class CreateLicenseInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  key: string;

  @Field(() => LicenseType)
  @IsNotEmpty()
  @IsEnum(LicenseType)
  type: LicenseType;

  @Field(() => LicenseStatus)
  @IsNotEmpty()
  @IsEnum(LicenseStatus)
  status: LicenseStatus;

  @Field()
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @Field()
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  expiryDate: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  organizationName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  contactPhone?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  features?: Record<string, any>;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  maxUsers?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  maxBranches?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;
}

@InputType()
export class UpdateLicenseInput {
  @Field(() => LicenseStatus, { nullable: true })
  @IsOptional()
  @IsEnum(LicenseStatus)
  status?: LicenseStatus;

  @Field({ nullable: true })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  expiryDate?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  organizationName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  contactPhone?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  features?: Record<string, any>;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  maxUsers?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  maxBranches?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;
}

@InputType()
export class LicenseFilterInput {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  id?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  key?: string;

  @Field(() => LicenseType, { nullable: true })
  @IsOptional()
  @IsEnum(LicenseType)
  type?: LicenseType;

  @Field(() => LicenseStatus, { nullable: true })
  @IsOptional()
  @IsEnum(LicenseStatus)
  status?: LicenseStatus;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  organizationName?: string;
}
