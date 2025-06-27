import { Field, InputType, Int } from '@nestjs/graphql';
import {
  IsDate,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { GraphQLISODateTime } from '@nestjs/graphql';

@InputType()
export class CreateChildrenEventInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => GraphQLISODateTime)
  @IsDate()
  startDateTime: Date;

  @Field(() => GraphQLISODateTime)
  @IsDate()
  endDateTime: Date;

  @Field()
  @IsString()
  @IsNotEmpty()
  location: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  ageRange?: string;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  capacity?: number;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  volunteersNeeded?: number;

  @Field()
  @IsString()
  @IsNotEmpty()
  branchId: string;
}
