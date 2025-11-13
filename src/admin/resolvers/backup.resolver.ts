import { Resolver, Query, Mutation, Args, Context, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { BackupService } from '../services/backup.service';
import { Backup } from '../entities/backup.entity';
import {
  CreateBackupInput,
  RestoreBackupInput,
  BackupFilterInput,
} from '../dto/backup.input';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { ParseUUIDPipe } from '@nestjs/common';

@Resolver(() => Backup)
@UseGuards(JwtAuthGuard, RolesGuard)
export class BackupResolver {
  constructor(private readonly backupService: BackupService) {}

  @Mutation(() => Backup)
  @Roles('ADMIN') // Restrict to super admins only for security
  async createBackup(
    @Args('input') input: CreateBackupInput,
    @Context() context: any,
  ): Promise<Backup> {
    const { req } = context;
    const userId = req.user?.id || input.userId;
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];

    return this.backupService.createBackup(
      { ...input, userId },
      ipAddress,
      userAgent,
    );
  }

  @Query(() => Backup)
  @Roles('ADMIN')
  async backup(
    @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
  ): Promise<Backup> {
    return this.backupService.getBackup(id);
  }

  @Query(() => [Backup])
  @Roles('ADMIN')
  async backups(
    @Args('filter', { nullable: true }) filter?: BackupFilterInput,
  ): Promise<Backup[]> {
    return this.backupService.getBackups(filter);
  }

  @Mutation(() => Backup)
  @Roles('ADMIN') // Restrict to super admins only for security
  async restoreBackup(
    @Args('input') input: RestoreBackupInput,
    @Context() context: any,
  ): Promise<Backup> {
    const { req } = context;
    const userId = req.user?.id || input.userId;
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];

    return this.backupService.restoreBackup(
      { ...input, userId },
      ipAddress,
      userAgent,
    );
  }
}
