import { InputType, Field, ID } from '@nestjs/graphql';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { DataOperationType } from '../entities/data-operation.entity';
import { GraphQLJSON } from 'graphql-type-json';

@InputType()
export class CreateDataImportInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  entityType: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  metadata?: Record<string, any>;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  filePath?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  userId?: string;
}

@InputType()
export class CreateDataExportInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  entityType: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  metadata?: Record<string, any>;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  userId?: string;
}

@InputType()
export class DataOperationFilterInput {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  id?: string;

  @Field(() => DataOperationType, { nullable: true })
  @IsOptional()
  @IsEnum(DataOperationType)
  type?: DataOperationType;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  entityType?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  status?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  startDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  endDate?: string;
}
