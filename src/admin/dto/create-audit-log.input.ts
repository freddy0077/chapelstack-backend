import { InputType, Field, ID } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

@InputType()
export class CreateAuditLogInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  action: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  entityType: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  entityId?: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  description: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  metadata?: Record<string, any>;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  userAgent?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  branchId?: string;
}
