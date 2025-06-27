"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../prisma/prisma.module");
const members_module_1 = require("../members/members.module");
const audit_log_service_1 = require("./services/audit-log.service");
const user_admin_service_1 = require("./services/user-admin.service");
const role_permission_service_1 = require("./services/role-permission.service");
const system_admin_service_1 = require("./services/system-admin.service");
const data_operation_service_1 = require("./services/data-operation.service");
const backup_service_1 = require("./services/backup.service");
const license_service_1 = require("./services/license.service");
const audit_log_resolver_1 = require("./resolvers/audit-log.resolver");
const user_admin_resolver_1 = require("./resolvers/user-admin.resolver");
const role_permission_resolver_1 = require("./resolvers/role-permission.resolver");
const system_admin_resolver_1 = require("./resolvers/system-admin.resolver");
const data_operation_resolver_1 = require("./resolvers/data-operation.resolver");
const backup_resolver_1 = require("./resolvers/backup.resolver");
const license_resolver_1 = require("./resolvers/license.resolver");
let AdminModule = class AdminModule {
};
exports.AdminModule = AdminModule;
exports.AdminModule = AdminModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, members_module_1.MembersModule],
        providers: [
            audit_log_service_1.AuditLogService,
            user_admin_service_1.UserAdminService,
            role_permission_service_1.RolePermissionService,
            system_admin_service_1.SystemAdminService,
            data_operation_service_1.DataOperationService,
            backup_service_1.BackupService,
            license_service_1.LicenseService,
            audit_log_resolver_1.AuditLogResolver,
            user_admin_resolver_1.UserAdminResolver,
            role_permission_resolver_1.RolePermissionResolver,
            system_admin_resolver_1.SystemAdminResolver,
            data_operation_resolver_1.DataOperationResolver,
            backup_resolver_1.BackupResolver,
            license_resolver_1.LicenseResolver,
        ],
        exports: [
            audit_log_service_1.AuditLogService,
            user_admin_service_1.UserAdminService,
            role_permission_service_1.RolePermissionService,
            system_admin_service_1.SystemAdminService,
            data_operation_service_1.DataOperationService,
            backup_service_1.BackupService,
            license_service_1.LicenseService,
        ],
    })
], AdminModule);
//# sourceMappingURL=admin.module.js.map