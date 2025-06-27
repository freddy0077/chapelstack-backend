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
exports.SystemAdminResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const system_admin_service_1 = require("../services/system-admin.service");
const system_health_entity_1 = require("../entities/system-health.entity");
const announcement_entity_1 = require("../entities/announcement.entity");
const common_1 = require("@nestjs/common");
const gql_auth_guard_1 = require("../../auth/guards/gql-auth.guard");
const roles_guard_1 = require("../../auth/guards/roles.guard");
const roles_decorator_1 = require("../../auth/decorators/roles.decorator");
const announcement_input_1 = require("../dto/announcement.input");
const current_user_decorator_1 = require("../../auth/decorators/current-user.decorator");
let SystemAdminResolver = class SystemAdminResolver {
    systemAdminService;
    constructor(systemAdminService) {
        this.systemAdminService = systemAdminService;
    }
    async getSystemHealth() {
        return this.systemAdminService.getSystemHealth();
    }
    async getAnnouncements(user, branchId) {
        return this.systemAdminService.getActiveAnnouncements(user.id, branchId);
    }
    async createAnnouncement(createAnnouncementInput) {
        const { title, content, startDate, endDate, targetRoleIds, targetBranchIds, } = createAnnouncementInput;
        return this.systemAdminService.createAnnouncement(title, content, new Date(startDate), new Date(endDate), targetRoleIds, targetBranchIds);
    }
    async updateAnnouncement(id, updateAnnouncementInput) {
        const { title, content, startDate, endDate, targetRoleIds, targetBranchIds, isActive, } = updateAnnouncementInput;
        return this.systemAdminService.updateAnnouncement(id, title, content, startDate ? new Date(startDate) : undefined, endDate ? new Date(endDate) : undefined, targetRoleIds, targetBranchIds, isActive);
    }
    async deleteAnnouncement(id) {
        return this.systemAdminService.deleteAnnouncement(id);
    }
};
exports.SystemAdminResolver = SystemAdminResolver;
__decorate([
    (0, graphql_1.Query)(() => system_health_entity_1.SystemHealth, { name: 'systemHealth' }),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN', 'SYSTEM_ADMIN'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SystemAdminResolver.prototype, "getSystemHealth", null);
__decorate([
    (0, graphql_1.Query)(() => [announcement_entity_1.Announcement], { name: 'announcements' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('branchId', { type: () => graphql_1.ID, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SystemAdminResolver.prototype, "getAnnouncements", null);
__decorate([
    (0, graphql_1.Mutation)(() => announcement_entity_1.Announcement),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN', 'SYSTEM_ADMIN'),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [announcement_input_1.CreateAnnouncementInput]),
    __metadata("design:returntype", Promise)
], SystemAdminResolver.prototype, "createAnnouncement", null);
__decorate([
    (0, graphql_1.Mutation)(() => announcement_entity_1.Announcement),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN', 'SYSTEM_ADMIN'),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, announcement_input_1.UpdateAnnouncementInput]),
    __metadata("design:returntype", Promise)
], SystemAdminResolver.prototype, "updateAnnouncement", null);
__decorate([
    (0, graphql_1.Mutation)(() => announcement_entity_1.Announcement),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN', 'SYSTEM_ADMIN'),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SystemAdminResolver.prototype, "deleteAnnouncement", null);
exports.SystemAdminResolver = SystemAdminResolver = __decorate([
    (0, graphql_1.Resolver)(),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [system_admin_service_1.SystemAdminService])
], SystemAdminResolver);
//# sourceMappingURL=system-admin.resolver.js.map