import { InputType, Field, ID } from '@nestjs/graphql';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { BackupType, BackupStatus } from '../entities/backup.entity';
import { GraphQLJSON } from 'graphql-type-json';

@InputType()
export class CreateBackupInput {
  @Field(() => BackupType)
  @IsNotEmpty()
  @IsEnum(BackupType)
  type: BackupType;

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
export class RestoreBackupInput {
  @Field(() => ID)
  @IsNotEmpty()
  @IsUUID()
  backupId: string;

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
export class BackupFilterInput {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  id?: string;

  @Field(() => BackupType, { nullable: true })
  @IsOptional()
  @IsEnum(BackupType)
  type?: BackupType;

  @Field(() => BackupStatus, { nullable: true })
  @IsOptional()
  @IsEnum(BackupStatus)
  status?: BackupStatus;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  startDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  endDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  createdAfter?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  createdBefore?: string;
}
