import { Module, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditModule } from '../audit/audit.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { GodModeDashboardResolver } from './resolvers/god-mode-dashboard.resolver';
import { GodModeDashboardService } from './services/god-mode-dashboard.service';
import { OrganizationManagementService } from './services/organization-management.service';
import { UserManagementService } from './services/user-management.service';
import { SystemConfigService } from './services/system-config.service';
import { AuditLogService } from './services/audit-log.service';
import { RoleManagementService } from './services/role-management.service';
import { PermissionManagementService } from './services/permission-management.service';
import { BranchesManagementService } from './services/branches-management.service';
import { LicensesManagementService } from './services/licenses-management.service';
import { BackupsManagementService } from './services/backups-management.service';
import { ModuleSettingsService } from './services/module-settings.service';
import { OrganizationResolver } from './resolvers/organization.resolver';
import { UserManagementResolver } from './resolvers/user-management.resolver';
import { SystemConfigResolver } from './resolvers/system-config.resolver';
import { AuditLogResolver } from './resolvers/audit-log.resolver';
import { RoleManagementResolver } from './resolvers/role-management.resolver';
import { PermissionManagementResolver } from './resolvers/permission-management.resolver';
import { BranchesResolver } from './resolvers/branches.resolver';
import { LicensesResolver } from './resolvers/licenses.resolver';
import { BackupsResolver } from './resolvers/backups.resolver';
import { SubscriptionsResolver } from './resolvers/subscriptions.resolver';
import { ModuleSettingsResolver } from './resolvers/module-settings.resolver';

@Module({
  imports: [AuditModule, forwardRef(() => SubscriptionsModule)],
  providers: [
    PrismaService,
    // Services
    GodModeDashboardService,
    OrganizationManagementService,
    UserManagementService,
    SystemConfigService,
    AuditLogService,
    RoleManagementService,
    PermissionManagementService,
    BranchesManagementService,
    LicensesManagementService,
    BackupsManagementService,
    ModuleSettingsService,
    // Resolvers
    GodModeDashboardResolver,
    OrganizationResolver,
    UserManagementResolver,
    SystemConfigResolver,
    AuditLogResolver,
    RoleManagementResolver,
    PermissionManagementResolver,
    BranchesResolver,
    LicensesResolver,
    BackupsResolver,
    SubscriptionsResolver,
    ModuleSettingsResolver,
  ],
  exports: [
    GodModeDashboardService,
    OrganizationManagementService,
    UserManagementService,
    SystemConfigService,
    AuditLogService,
    RoleManagementService,
    PermissionManagementService,
    BranchesManagementService,
    LicensesManagementService,
    BackupsManagementService,
    ModuleSettingsService,
  ],
})
export class GodModeModule {}
