import { Field, InputType } from '@nestjs/graphql';
import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { GraphQLISODateTime } from '@nestjs/graphql';

@InputType()
export class CreateChildInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @Field(() => GraphQLISODateTime)
  @IsDate()
  dateOfBirth: Date;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  gender?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  allergies?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  specialNeeds?: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  emergencyContactName: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  emergencyContactPhone: string;

  @Field({ defaultValue: false })
  @IsBoolean()
  @IsOptional()
  photoConsent?: boolean;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  notes?: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  branchId: string;
}
