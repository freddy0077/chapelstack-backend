import { Field, InputType, ID } from '@nestjs/graphql';
import { IsOptional, IsUUID, IsDateString } from 'class-validator';

@InputType()
export class MarriageAnalyticsInput {
  @Field(() => ID)
  @IsUUID()
  branchId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  organisationId?: string;
}

@InputType()
export class MemberMarriageHistoryInput {
  @Field(() => ID)
  @IsUUID()
  memberId: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  branchId?: string;
}
