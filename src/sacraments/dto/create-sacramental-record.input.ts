import { Field, InputType } from '@nestjs/graphql';
import { SacramentType } from '@prisma/client';
import {
  IsDate,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { SacramentTypeEnum } from '../entities/sacramental-record.entity';

// Define valid sacrament types as an array of strings for validation
const VALID_SACRAMENT_TYPES = Object.values(SacramentTypeEnum);

@InputType()
export class CreateSacramentalRecordInput {
  @Field()
  @IsUUID()
  @IsNotEmpty()
  memberId: string;

  @Field(() => SacramentTypeEnum)
  @IsIn(VALID_SACRAMENT_TYPES, {
    message: 'sacramentType must be a valid SacramentType enum value',
  })
  @IsNotEmpty()
  sacramentType: SacramentType;

  @Field()
  @IsDate()
  @IsNotEmpty()
  dateOfSacrament: Date;

  @Field()
  @IsString()
  @IsNotEmpty()
  locationOfSacrament: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  officiantName: string;

  @Field({ nullable: true })
  @IsUUID()
  @IsOptional()
  officiantId?: string;

  // NEW: Marriage-specific member relationship fields
  @Field({ nullable: true })
  @IsUUID()
  @IsOptional()
  groomMemberId?: string;

  @Field({ nullable: true })
  @IsUUID()
  @IsOptional()
  brideMemberId?: string;

  // NEW: Witness member relationship fields
  @Field({ nullable: true })
  @IsUUID()
  @IsOptional()
  witness1MemberId?: string;

  @Field({ nullable: true })
  @IsUUID()
  @IsOptional()
  witness2MemberId?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  godparent1Name?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  godparent2Name?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  sponsorName?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  witness1Name?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  witness2Name?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  groomName?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  brideName?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  certificateNumber?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  certificateUrl?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  notes?: string;

  @Field()
  @IsUUID()
  @IsNotEmpty()
  branchId: string;

  @Field({ nullable: true })
  @IsUUID()
  @IsOptional()
  organisationId?: string;
}
