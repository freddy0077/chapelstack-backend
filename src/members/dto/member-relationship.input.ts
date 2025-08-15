import { InputType, Field, ID } from '@nestjs/graphql';
import {
  IsUUID,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsString,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';
import { GraphQLISODateTime } from '@nestjs/graphql';
import { RelationshipType } from '../entities/member.entity';

@InputType()
export class CreateMemberRelationshipInput {
  @Field(() => ID)
  @IsUUID()
  primaryMemberId: string;

  @Field(() => ID)
  @IsUUID()
  relatedMemberId: string;

  @Field(() => RelationshipType)
  @IsEnum(RelationshipType)
  relationshipType: RelationshipType;

  @Field(() => Boolean, { defaultValue: false })
  @IsOptional()
  @IsBoolean()
  isEmergencyContact?: boolean;

  @Field(() => Boolean, { defaultValue: false })
  @IsOptional()
  @IsBoolean()
  isGuardian?: boolean;

  @Field(() => Boolean, { defaultValue: false })
  @IsOptional()
  @IsBoolean()
  canPickupChildren?: boolean;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  relationshipStart?: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  relationshipEnd?: Date;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;
}

@InputType()
export class UpdateMemberRelationshipInput {
  @Field(() => ID)
  @IsUUID()
  id: string;

  @Field(() => RelationshipType, { nullable: true })
  @IsOptional()
  @IsEnum(RelationshipType)
  relationshipType?: RelationshipType;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  isEmergencyContact?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  isGuardian?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  canPickupChildren?: boolean;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  relationshipStart?: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  relationshipEnd?: Date;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;
}
