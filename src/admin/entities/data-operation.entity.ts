import {
  ObjectType,
  Field,
  ID,
  GraphQLISODateTime,
  registerEnumType,
} from '@nestjs/graphql';
import { User } from '../../auth/entities/user.entity';
import { GraphQLJSON } from 'graphql-type-json';

export enum DataOperationType {
  IMPORT = 'IMPORT',
  EXPORT = 'EXPORT',
}

export enum DataOperationStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

registerEnumType(DataOperationType, {
  name: 'DataOperationType',
  description: 'Type of data operation (import or export)',
});

registerEnumType(DataOperationStatus, {
  name: 'DataOperationStatus',
  description: 'Status of a data operation',
});

@ObjectType()
export class DataOperation {
  @Field(() => ID)
  id: string;

  @Field(() => DataOperationType)
  type: DataOperationType;

  @Field(() => DataOperationStatus)
  status: DataOperationStatus;

  @Field()
  entityType: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  metadata?: Record<string, any>;

  @Field({ nullable: true })
  filePath?: string;

  @Field({ nullable: true })
  fileSize?: number;

  @Field({ nullable: true })
  recordCount?: number;

  @Field({ nullable: true })
  errorCount?: number;

  @Field(() => GraphQLJSON, { nullable: true })
  errors?: Record<string, any>[];

  @Field(() => ID, { nullable: true })
  userId?: string;

  @Field(() => User, { nullable: true })
  user?: User;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  completedAt?: Date;
}
