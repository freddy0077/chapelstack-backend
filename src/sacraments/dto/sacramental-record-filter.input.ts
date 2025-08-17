import { Field, InputType } from '@nestjs/graphql';
import { SacramentType } from '@prisma/client';
import { IsDate, IsIn, IsOptional, IsString, IsUUID } from 'class-validator';
import { SacramentTypeEnum } from '../entities/sacramental-record.entity';

// Define valid sacrament types as an array of strings for validation
const VALID_SACRAMENT_TYPES = Object.values(SacramentTypeEnum);

@InputType()
export class SacramentalRecordFilterInput {
  @Field(() => SacramentTypeEnum, { nullable: true })
  @IsIn(VALID_SACRAMENT_TYPES, {
    message: 'sacramentType must be a valid SacramentType enum value',
  })
  @IsOptional()
  sacramentType?: SacramentType;

  @Field({ nullable: true })
  @IsDate()
  @IsOptional()
  dateFrom?: Date;

  @Field({ nullable: true })
  @IsDate()
  @IsOptional()
  dateTo?: Date;

  @Field({ nullable: true })
  @IsUUID()
  @IsOptional()
  memberId?: string;

  @Field({ nullable: true })
  @IsUUID()
  @IsOptional()
  branchId?: string;

  @Field({ nullable: true })
  @IsUUID()
  @IsOptional()
  organisationId?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  certificateNumber?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  officiantName?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  locationOfSacrament?: string;
}
