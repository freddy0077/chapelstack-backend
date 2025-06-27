import { Field, ID, InputType } from '@nestjs/graphql';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export enum MinistryType {
  WORSHIP = 'WORSHIP',
  OUTREACH = 'OUTREACH',
  EDUCATION = 'EDUCATION',
  PRAYER = 'PRAYER',
  YOUTH = 'YOUTH',
  CHILDREN = 'CHILDREN',
  MISSIONS = 'MISSIONS',
  ADMINISTRATION = 'ADMINISTRATION',
  OTHER = 'OTHER',
}

export enum MinistryStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

@InputType()
export class CreateMinistryInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field()
  @IsEnum(MinistryType)
  @IsNotEmpty()
  type: string;

  @Field()
  @IsEnum(MinistryStatus)
  @IsNotEmpty()
  status: string;

  @Field({ nullable: true })
  @IsUUID()
  @IsOptional()
  branchId?: string;

  @Field({ nullable: true })
  @IsUUID()
  @IsOptional()
  parentId?: string;

  @Field(() => ID, { nullable: true })
  @IsUUID()
  @IsOptional()
  organisationId?: string;
}

@InputType()
export class UpdateMinistryInput {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  name?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field({ nullable: true })
  @IsEnum(MinistryType)
  @IsOptional()
  type?: string;

  @Field({ nullable: true })
  @IsEnum(MinistryStatus)
  @IsOptional()
  status?: string;

  @Field({ nullable: true })
  @IsUUID()
  @IsOptional()
  branchId?: string;

  @Field({ nullable: true })
  @IsUUID()
  @IsOptional()
  parentId?: string;

  @Field(() => ID, { nullable: true })
  @IsUUID()
  @IsOptional()
  organisationId?: string;
}

@InputType()
export class MinistryFilterInput {
  @Field(() => ID, { nullable: true })
  @IsUUID()
  @IsOptional()
  id?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  name?: string;

  @Field({ nullable: true })
  @IsEnum(MinistryType)
  @IsOptional()
  type?: string;

  @Field({ nullable: true })
  @IsEnum(MinistryStatus)
  @IsOptional()
  status?: string;

  @Field({ nullable: true })
  @IsUUID()
  @IsOptional()
  branchId?: string;

  @Field({ nullable: true })
  @IsUUID()
  @IsOptional()
  parentId?: string;

  @Field(() => ID, { nullable: true })
  @IsUUID()
  @IsOptional()
  organisationId?: string;
}
