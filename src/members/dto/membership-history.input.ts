import { InputType, Field, ID } from '@nestjs/graphql';
import { IsUUID, IsEnum, IsOptional, IsString } from 'class-validator';
import { GraphQLJSON } from 'graphql-type-json';
import { MembershipStatus } from '../entities/member.entity';

@InputType()
export class CreateMembershipHistoryInput {
  @Field(() => ID)
  @IsUUID()
  memberId: string;

  @Field(() => MembershipStatus, { nullable: true })
  @IsOptional()
  @IsEnum(MembershipStatus)
  fromStatus?: MembershipStatus;

  @Field(() => MembershipStatus)
  @IsEnum(MembershipStatus)
  toStatus: MembershipStatus;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  changeReason?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  fromBranchId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  toBranchId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  approvedBy?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  metadata?: any;
}
