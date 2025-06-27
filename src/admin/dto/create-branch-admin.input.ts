import { InputType, Field, ID } from '@nestjs/graphql';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsUUID,
} from 'class-validator';

@InputType()
export class CreateBranchAdminInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @Field()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @Field()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @Field(() => ID)
  @IsNotEmpty()
  @IsUUID()
  branchId: string;

  @Field(() => ID)
  @IsNotEmpty()
  @IsUUID()
  organisationId: string;
}
