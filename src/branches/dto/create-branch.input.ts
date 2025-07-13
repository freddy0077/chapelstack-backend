import { InputType, Field, GraphQLISODateTime } from '@nestjs/graphql';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsBoolean,
  IsDate,
  MaxLength,
  ValidateIf,
} from 'class-validator';

@InputType()
export class CreateBranchInput {
  @Field()
  @IsNotEmpty({ message: 'Branch name cannot be empty.' })
  @IsString()
  @MaxLength(255)
  name: string;

  @Field()
  @IsNotEmpty({ message: 'Organisation ID is required.' })
  @IsString()
  organisationId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  state?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  postalCode?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(30) // Adjusted for typical phone number lengths
  phoneNumber?: string;

  @Field({ nullable: true })
  @IsOptional()
  @ValidateIf(
    (o) => o.email !== '' && o.email !== null && o.email !== undefined,
  )
  @IsEmail({}, { message: 'Please provide a valid email address.' })
  @MaxLength(255)
  email?: string;

  @Field({ nullable: true })
  @IsOptional()
  @ValidateIf(
    (o) => o.website !== '' && o.website !== null && o.website !== undefined,
  )
  @IsUrl({}, { message: 'Please provide a valid URL for the website.' })
  @MaxLength(255)
  website?: string;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @IsOptional()
  @IsDate()
  establishedAt?: Date;

  @Field({ nullable: true, defaultValue: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}
