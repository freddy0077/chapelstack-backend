import { InputType, Field, ID } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsUUID, MinLength, IsArray } from 'class-validator';

@InputType()
export class CreateUserFromMemberInput {
  @Field(() => ID)
  @IsNotEmpty()
  @IsUUID()
  memberId: string;

  @Field()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Field()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @Field(() => [ID])
  @IsArray()
  roleIds: string[];

  @Field(() => ID)
  @IsNotEmpty()
  @IsUUID()
  organisationId: string;

  @Field(() => ID)
  @IsNotEmpty()
  @IsUUID()
  branchId: string;
}
