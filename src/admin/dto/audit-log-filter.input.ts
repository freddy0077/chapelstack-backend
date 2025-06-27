import { InputType, Field, ID } from '@nestjs/graphql';
import { IsOptional, IsString, IsUUID, IsDateString } from 'class-validator';

@InputType()
export class AuditLogFilterInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  action?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  entityType?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  entityId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  descriptionContains?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  createdAfter?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  createdBefore?: string;
}
