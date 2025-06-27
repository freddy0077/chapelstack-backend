import { Field, InputType } from '@nestjs/graphql';
import { EmailScalar } from '../../base/graphql/EmailScalar';
import { PhoneNumberScalar } from '../../base/graphql/PhoneNumberScalar';
import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  MaxLength,
} from 'class-validator';

@InputType()
export class SignUpDto {
  @IsEmail({}, { message: 'Please enter a valid email address.' })
  @Field(() => EmailScalar)
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long.' })
  // Consider adding @Matches for password complexity if required
  @Field(() => String)
  password: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Field(() => String, { nullable: true })
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Field(() => String, { nullable: true })
  lastName?: string;

  // Add other fields as necessary, e.g., phoneNumber
  @IsOptional()
  @IsString()
  @MaxLength(20) // Example length, adjust as needed
  @Field(() => PhoneNumberScalar, { nullable: true })
  phoneNumber?: string;
}
