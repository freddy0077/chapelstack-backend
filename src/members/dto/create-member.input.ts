import { InputType, Field, ID } from '@nestjs/graphql';
import {
  IsEmail,
  IsOptional,
  IsNotEmpty,
  IsDate,
  IsString,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Gender, MaritalStatus, MemberStatus } from '../entities/member.entity';
import { GraphQLJSON } from 'graphql-type-json';
import { GraphQLISODateTime } from '@nestjs/graphql';
import { IsValidEnum } from '../../common/utils/enum-validation.util';

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
  @IsEmail()
  email?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  address?: string;

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

  @Field(() => GraphQLISODateTime, { nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dateOfBirth?: Date;

  @Field(() => Gender, { nullable: true })
  @IsOptional()
  @IsValidEnum(Gender)
  gender?: Gender;

  @Field(() => MaritalStatus, { nullable: true })
  @IsOptional()
  @IsValidEnum(MaritalStatus)
  maritalStatus?: MaritalStatus;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  occupation?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  employerName?: string;

  @Field(() => MemberStatus)
  @IsNotEmpty()
  @IsValidEnum(MemberStatus)
  status: MemberStatus = MemberStatus.ACTIVE;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  membershipDate?: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  baptismDate?: Date | null;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  confirmationDate?: Date;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  customFields?: any;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  privacySettings?: any;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  spouseId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  organisationId?: string;
}
