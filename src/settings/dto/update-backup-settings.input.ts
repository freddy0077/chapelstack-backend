import { InputType, Field, ID } from '@nestjs/graphql';
import { IsOptional, IsBoolean, IsEnum, IsString, IsInt } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

@InputType()
export class UpdateBackupSettingsInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  autoBackup?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsEnum(['DAILY', 'WEEKLY', 'MONTHLY'])
  frequency?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  time?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEnum(['LOCAL', 'AWS_S3', 'GOOGLE_CLOUD', 'AZURE'])
  storageType?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  storageConfig?: any;

  @Field({ nullable: true })
  @IsOptional()
  @IsInt()
  retentionDays?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsInt()
  maxBackups?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  encryptBackups?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  encryptionKey?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  notifyOnSuccess?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  notifyOnFailure?: boolean;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  notificationEmails?: string[];
}

@InputType()
export class RestoreBackupInput {
  @Field(() => ID)
  @IsString()
  backupId: string;
}
