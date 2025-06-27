import { Field, ID, InputType } from '@nestjs/graphql';
import { IsDate, IsOptional, IsString, IsUUID } from 'class-validator';

@InputType()
export class CommunicationStatsFilterInput {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  startDate?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  endDate?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  channels?: string[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  statuses?: string[];

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  groupBy?: string;
}
