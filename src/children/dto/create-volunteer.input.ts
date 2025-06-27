import { Field, InputType } from '@nestjs/graphql';
import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { GraphQLISODateTime } from '@nestjs/graphql';

@InputType()
export class CreateVolunteerInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  memberId: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  role: string;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @IsDate()
  @IsOptional()
  backgroundCheckDate?: Date;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  backgroundCheckStatus?: string;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @IsDate()
  @IsOptional()
  trainingCompletionDate?: Date;

  @Field({ defaultValue: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  notes?: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  branchId: string;
}
