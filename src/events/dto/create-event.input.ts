import { InputType, Field } from '@nestjs/graphql';
import { GraphQLISODateTime } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsDate,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
export class CreateEventInput {
  @Field()
  @IsNotEmpty({ message: 'Title is required' })
  @IsString()
  title: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => GraphQLISODateTime)
  @IsNotEmpty({ message: 'Start date is required' })
  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  location?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  category?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  organisationId?: string;
}
