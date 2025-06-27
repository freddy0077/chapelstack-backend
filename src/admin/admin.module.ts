import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { MembersModule } from '../members/members.module';

// Services
import { AuditLogService } from './services/audit-log.service';
import { UserAdminService } from './services/user-admin.service';
import { RolePermissionService } from './services/role-permission.service';
import { SystemAdminService } from './services/system-admin.service';
import { DataOperationService } from './services/data-operation.service';
import { BackupService } from './services/backup.service';
import { LicenseService } from './services/license.service';

// Resolvers
import { AuditLogResolver } from './resolvers/audit-log.resolver';
import { UserAdminResolver } from './resolvers/user-admin.resolver';
import { RolePermissionResolver } from './resolvers/role-permission.resolver';
import { SystemAdminResolver } from './resolvers/system-admin.resolver';
import { DataOperationResolver } from './resolvers/data-operation.resolver';
import { BackupResolver } from './resolvers/backup.resolver';
import { LicenseResolver } from './resolvers/license.resolver';

@Module({
  imports: [PrismaModule, MembersModule],
  providers: [
    // Services
    AuditLogService,
    UserAdminService,
    RolePermissionService,
    SystemAdminService,
    DataOperationService,
    BackupService,
    LicenseService,

    // Resolvers
    AuditLogResolver,
    UserAdminResolver,
    RolePermissionResolver,
    SystemAdminResolver,
    DataOperationResolver,
    BackupResolver,
    LicenseResolver,
  ],
  exports: [
    AuditLogService,
    UserAdminService,
    RolePermissionService,
    SystemAdminService,
    DataOperationService,
    BackupService,
    LicenseService,
  ],
})
export class AdminModule {}
