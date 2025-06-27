import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { EmailScalar } from '../../base/graphql/EmailScalar';

@InputType()
export class SignInDto {
  @IsEmail({}, { message: 'Please enter a valid email address.' })
  @Field(() => EmailScalar)
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long.' })
  @Field(() => String)
  password: string;
}
