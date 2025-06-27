import { Field, InputType } from '@nestjs/graphql';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

@InputType()
export class CreateGuardianInput {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  memberId?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  firstName?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  lastName?: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  relationship: string;

  @Field({ defaultValue: false })
  @IsBoolean()
  @IsOptional()
  isPrimaryGuardian?: boolean;

  @Field({ defaultValue: true })
  @IsBoolean()
  @IsOptional()
  canPickup?: boolean;

  @Field()
  @IsString()
  @IsNotEmpty()
  phone: string;

  @Field({ nullable: true })
  @IsEmail()
  @IsOptional()
  email?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  address?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  notes?: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  branchId: string;
}
