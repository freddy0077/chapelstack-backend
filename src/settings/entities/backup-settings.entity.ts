import { ObjectType, Field, ID, Int } from '@nestjs/graphql';;
import GraphQLJSON from 'graphql-type-json';

@ObjectType()
export class BackupSettingsEntity {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  branchId: string;

  @Field(() => Boolean)
  autoBackup: boolean;

  @Field({ nullable: true })
  frequency?: string;

  @Field({ nullable: true })
  time?: string;

  @Field({ nullable: true })
  storageType?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  storageConfig?: any;

  @Field(() => Int)
  retentionDays: number;

  @Field(() => Int)
  maxBackups: number;

  @Field(() => Boolean)
  encryptBackups: boolean;

  // Note: Encryption key is never returned via GraphQL
  // @Field({ nullable: true })
  // encryptionKey?: string;

  @Field(() => Boolean)
  notifyOnSuccess: boolean;

  @Field(() => Boolean)
  notifyOnFailure: boolean;

  @Field(() => [String], { nullable: true })
  notificationEmails?: string[];

  @Field({ nullable: true })
  lastBackupAt?: Date;

  @Field({ nullable: true })
  lastBackupStatus?: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

@ObjectType()
export class BackupEntity {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  branchId: string;

  @Field(() => String)
  filename: string;

  @Field(() => String)
  fileSize: string; // BigInt as string

  @Field(() => String)
  storageLocation: string;

  @Field({ nullable: true })
  storagePath?: string;

  @Field(() => String)
  backupType: string;

  @Field(() => String)
  status: string;

  @Field({ nullable: true })
  error?: string;

  @Field({ nullable: true })
  checksum?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  recordCount?: any;

  @Field(() => [String], { nullable: true })
  tablesBackedUp?: string[];

  @Field({ nullable: true })
  completedAt?: Date;

  @Field(() => ID, { nullable: true })
  createdById?: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

@ObjectType()
export class BackupListEntity {
  @Field(() => [BackupEntity])
  backups: BackupEntity[];

  @Field(() => Int)
  total: number;
}
