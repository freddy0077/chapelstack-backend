import { InputType, Field, ID } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsOptional,
  IsDate,
  IsString,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MilestoneType } from '../entities/spiritual-milestone.entity';
import { GraphQLJSON } from 'graphql-type-json';
import { GraphQLISODateTime } from '@nestjs/graphql';
import { IsValidEnum } from '../../common/utils/enum-validation.util';

@InputType()
export class CreateSpiritualMilestoneInput {
  @Field(() => MilestoneType)
  @IsNotEmpty()
  @IsValidEnum(MilestoneType)
  type: MilestoneType;

  @Field(() => GraphQLISODateTime)
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  date: Date;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  location?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  performedBy?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  additionalDetails?: any;

  @Field(() => ID)
  @IsNotEmpty()
  @IsUUID()
  memberId: string;
}
