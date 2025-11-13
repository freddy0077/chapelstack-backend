import {
  Resolver,
  Query,
  Mutation,
  Args,
  Context,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { BackupsManagementService } from '../services/backups-management.service';
import { ObjectType, Field, InputType, Int } from '@nestjs/graphql';

@ObjectType()
export class GodModeBackupType {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field()
  type: string;

  @Field()
  status: string;

  @Field()
  size: number;

  @Field()
  createdAt: Date;

  @Field({ nullable: true })
  completedAt?: Date;

  @Field(() => Int)
  retentionDays: number;

  @Field()
  isAutomatic: boolean;

  @Field({ nullable: true })
  description?: string;
}

@ObjectType()
export class BackupsResponseType {
  @Field(() => [GodModeBackupType])
  backups: GodModeBackupType[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  skip: number;

  @Field(() => Int)
  take: number;
}

@ObjectType()
export class BackupStatsType {
  @Field(() => Int)
  totalBackups: number;

  @Field()
  totalSize: number;

  @Field({ nullable: true })
  lastBackupDate?: Date;

  @Field({ nullable: true })
  nextScheduledBackup?: Date;

  @Field()
  storageUsed: number;

  @Field()
  storageQuota: number;
}

@InputType()
export class CreateBackupInputType {
  @Field()
  name: string;

  @Field()
  type: string;

  @Field(() => Int)
  retentionDays: number;

  @Field({ nullable: true })
  description?: string;
}

@InputType()
export class ScheduleBackupInputType {
  @Field()
  frequency: string;

  @Field(() => Int)
  retentionDays: number;

  @Field({ nullable: true })
  description?: string;
}

@Resolver()
export class BackupsResolver {
  constructor(private backupsService: BackupsManagementService) {}

  @Query(() => BackupsResponseType, { name: 'godModeBackups' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GOD_MODE', 'SYSTEM_ADMIN')
  async getBackups(
    @Args('skip', { type: () => Int, nullable: true }) skip: number = 0,
    @Args('take', { type: () => Int, nullable: true }) take: number = 10,
    @Context() context: any,
  ) {
    return this.backupsService.getBackups(skip, take);
  }

  @Query(() => GodModeBackupType, { name: 'godModeBackup' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GOD_MODE', 'SYSTEM_ADMIN')
  async getBackup(
    @Args('id') id: string,
    @Context() context: any,
  ) {
    return this.backupsService.getBackupById(id);
  }

  @Query(() => BackupStatsType, { name: 'godModeBackupStats' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GOD_MODE', 'SYSTEM_ADMIN')
  async getBackupStats(
    @Context() context: any,
  ) {
    return this.backupsService.getBackupStats();
  }

  @Mutation(() => GodModeBackupType, { name: 'godModeCreateBackup' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GOD_MODE', 'SYSTEM_ADMIN')
  async createBackup(
    @Args('input') input: CreateBackupInputType,
    @Context() context: any,
  ) {
    return this.backupsService.createBackup(input);
  }

  @Mutation(() => String, { name: 'godModeDeleteBackup' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GOD_MODE', 'SYSTEM_ADMIN')
  async deleteBackup(
    @Args('id') id: string,
    @Context() context: any,
  ) {
    const result = await this.backupsService.deleteBackup(id);
    return JSON.stringify(result);
  }

  @Mutation(() => GodModeBackupType, { name: 'godModeRestoreBackup' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GOD_MODE', 'SYSTEM_ADMIN')
  async restoreBackup(
    @Args('id') id: string,
    @Context() context: any,
  ) {
    return this.backupsService.restoreBackup(id);
  }

  @Mutation(() => String, { name: 'godModeDownloadBackup' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GOD_MODE', 'SYSTEM_ADMIN')
  async downloadBackup(
    @Args('id') id: string,
    @Context() context: any,
  ) {
    const result = await this.backupsService.downloadBackup(id);
    return JSON.stringify(result);
  }

  @Mutation(() => GodModeBackupType, { name: 'godModeScheduleBackup' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('GOD_MODE', 'SYSTEM_ADMIN')
  async scheduleBackup(
    @Args('input') input: ScheduleBackupInputType,
    @Context() context: any,
  ) {
    return this.backupsService.scheduleBackup(input);
  }
}
