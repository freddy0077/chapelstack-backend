"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackupResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const backup_service_1 = require("../services/backup.service");
const backup_entity_1 = require("../entities/backup.entity");
const backup_input_1 = require("../dto/backup.input");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../auth/guards/roles.guard");
const roles_decorator_1 = require("../../auth/decorators/roles.decorator");
const common_2 = require("@nestjs/common");
let BackupResolver = class BackupResolver {
    backupService;
    constructor(backupService) {
        this.backupService = backupService;
    }
    async createBackup(input, context) {
        const { req } = context;
        const userId = req.user?.id || input.userId;
        const ipAddress = req.ip;
        const userAgent = req.headers['user-agent'];
        return this.backupService.createBackup({ ...input, userId }, ipAddress, userAgent);
    }
    async backup(id) {
        return this.backupService.getBackup(id);
    }
    async backups(filter) {
        return this.backupService.getBackups(filter);
    }
    async restoreBackup(input, context) {
        const { req } = context;
        const userId = req.user?.id || input.userId;
        const ipAddress = req.ip;
        const userAgent = req.headers['user-agent'];
        return this.backupService.restoreBackup({ ...input, userId }, ipAddress, userAgent);
    }
};
exports.BackupResolver = BackupResolver;
__decorate([
    (0, graphql_1.Mutation)(() => backup_entity_1.Backup),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN'),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [backup_input_1.CreateBackupInput, Object]),
    __metadata("design:returntype", Promise)
], BackupResolver.prototype, "createBackup", null);
__decorate([
    (0, graphql_1.Query)(() => backup_entity_1.Backup),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN'),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID }, common_2.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BackupResolver.prototype, "backup", null);
__decorate([
    (0, graphql_1.Query)(() => [backup_entity_1.Backup]),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN'),
    __param(0, (0, graphql_1.Args)('filter', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [backup_input_1.BackupFilterInput]),
    __metadata("design:returntype", Promise)
], BackupResolver.prototype, "backups", null);
__decorate([
    (0, graphql_1.Mutation)(() => backup_entity_1.Backup),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN'),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [backup_input_1.RestoreBackupInput, Object]),
    __metadata("design:returntype", Promise)
], BackupResolver.prototype, "restoreBackup", null);
exports.BackupResolver = BackupResolver = __decorate([
    (0, graphql_1.Resolver)(() => backup_entity_1.Backup),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [backup_service_1.BackupService])
], BackupResolver);
//# sourceMappingURL=backup.resolver.js.map