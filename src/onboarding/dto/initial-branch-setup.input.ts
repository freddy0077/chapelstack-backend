import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType()
export class InitialBranchSetupInput {
  @Field()
  @IsString()
  @IsNotEmpty({ message: 'Branch name is required' })
  name: string;

  @Field()
  @IsString()
  @IsNotEmpty({ message: 'Organisation ID is required' })
  organisationId: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  address?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  city?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  country?: string;

  @Field({ nullable: true })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsOptional()
  email?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  timezone?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  currency?: string;
}
