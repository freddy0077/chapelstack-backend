import { InputType, Field, ID } from '@nestjs/graphql';
import { IsOptional, IsUUID, IsString, IsDate } from 'class-validator';
import { GraphQLISODateTime } from '@nestjs/graphql';

@InputType()
export class AttendanceFilterInput {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  memberId?: string;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @IsOptional()
  @IsDate()
  startDate?: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @IsOptional()
  @IsDate()
  endDate?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  checkInMethod?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  visitorNameContains?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  branchId?: string;
}
