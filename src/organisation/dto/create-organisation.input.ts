import { InputType, Field } from '@nestjs/graphql';
import {
  IsString,
  IsEmail,
  IsOptional,
  IsUrl,
  IsInt,
  IsPhoneNumber,
  IsNotEmpty,
} from 'class-validator';

@InputType()
export class CreateOrganisationInput {
  @Field()
  @IsString()
  name: string;

  @Field({ nullable: true })
  @IsEmail({}, { each: false, message: 'Email must be valid', always: false })
  @IsOptional()
  email?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsPhoneNumber()
  phoneNumber?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl({}, { message: 'Website must be a valid URL', always: false })
  website?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  address?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  city?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  state?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  country?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  zipCode?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  denomination?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsInt()
  foundingYear?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  size?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  vision?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  missionStatement?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  timezone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  currency?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  primaryColor?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  secondaryColor?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  accentColor?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  faviconUrl?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  slogan?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  brandFont?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  socialHandle?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  fontFamily?: string;
}
