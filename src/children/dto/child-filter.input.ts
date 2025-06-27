import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';
import { GraphQLISODateTime } from '@nestjs/graphql';

@InputType()
export class ChildFilterInput {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  firstName?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  lastName?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  gender?: string;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @IsOptional()
  dateOfBirthFrom?: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @IsOptional()
  dateOfBirthTo?: Date;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  branchId?: string;
}
