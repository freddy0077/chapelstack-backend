import { InputType, Field, ID } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional, IsString, IsUUID, MinLength, ValidateNested } from 'class-validator';

@InputType()
class UserInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @Field(() => String)
  @IsString()
  @MinLength(8)
  password: string;

  @Field()
  @IsString()
  roleName: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  branchId?: string;
}

@InputType()
export class CreateUsersWithRoleInput {
  @Field(() => [UserInput])
  @ValidateNested({ each: true })
  @Type(() => UserInput)
  users: UserInput[];

  @Field(() => ID)
  @IsUUID()
  organisationId: string;
}
