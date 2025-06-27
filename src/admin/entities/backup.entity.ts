import {
  ObjectType,
  Field,
  ID,
  GraphQLISODateTime,
  registerEnumType,
} from '@nestjs/graphql';
import { User } from '../../auth/entities/user.entity';
import { GraphQLJSON } from 'graphql-type-json';

export enum BackupStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum BackupType {
  FULL = 'FULL',
  INCREMENTAL = 'INCREMENTAL',
  SCHEDULED = 'SCHEDULED',
  MANUAL = 'MANUAL',
}

registerEnumType(BackupStatus, {
  name: 'BackupStatus',
  description: 'Status of a backup operation',
});

registerEnumType(BackupType, {
  name: 'BackupType',
  description: 'Type of backup operation',
});

@ObjectType()
export class Backup {
  @Field(() => ID)
  id: string;

  @Field(() => BackupType)
  type: BackupType;

  @Field(() => BackupStatus)
  status: BackupStatus;

  @Field({ nullable: true })
  description?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  metadata?: Record<string, any>;

  @Field({ nullable: true })
  filePath?: string;

  @Field({ nullable: true })
  fileSize?: number;

  @Field({ nullable: true })
  duration?: number;

  @Field(() => GraphQLJSON, { nullable: true })
  errorDetails?: Record<string, any>;

  @Field(() => ID, { nullable: true })
  userId?: string;

  @Field(() => User, { nullable: true })
  user?: User;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  completedAt?: Date;
}
