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
exports.RolePermissionResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const role_permission_service_1 = require("../services/role-permission.service");
const common_1 = require("@nestjs/common");
const gql_auth_guard_1 = require("../../auth/guards/gql-auth.guard");
const roles_guard_1 = require("../../auth/guards/roles.guard");
const roles_decorator_1 = require("../../auth/decorators/roles.decorator");
const role_entity_1 = require("../../auth/entities/role.entity");
const permission_entity_1 = require("../../auth/entities/permission.entity");
const role_permission_input_1 = require("../dto/role-permission.input");
let RolePermissionResolver = class RolePermissionResolver {
    rolePermissionService;
    constructor(rolePermissionService) {
        this.rolePermissionService = rolePermissionService;
    }
    async findAllRoles() {
        return this.rolePermissionService.findAllRoles();
    }
    async findRoleById(id) {
        return this.rolePermissionService.findRoleById(id);
    }
    async createRole(createRoleInput) {
        return this.rolePermissionService.createRole(createRoleInput.name, createRoleInput.description);
    }
    async updateRole(id, updateRoleInput) {
        return this.rolePermissionService.updateRole(id, updateRoleInput.name, updateRoleInput.description);
    }
    async deleteRole(id) {
        return this.rolePermissionService.deleteRole(id);
    }
    async createRoleWithPermissions(input) {
        return this.rolePermissionService.createRoleWithPermissions(input.name, input.description, input.permissionIds);
    }
    async findAllPermissions() {
        return this.rolePermissionService.findAllPermissions();
    }
    async findPermissionById(id) {
        return this.rolePermissionService.findPermissionById(id);
    }
    async createPermission(createPermissionInput) {
        return this.rolePermissionService.createPermission(createPermissionInput.action, createPermissionInput.subject, createPermissionInput.description);
    }
    async updatePermission(id, updatePermissionInput) {
        return this.rolePermissionService.updatePermission(id, updatePermissionInput.action, updatePermissionInput.subject, updatePermissionInput.description);
    }
    async deletePermission(id) {
        return this.rolePermissionService.deletePermission(id);
    }
    async assignPermissionToRole(roleId, permissionId) {
        return this.rolePermissionService.assignPermissionToRole(roleId, permissionId);
    }
    async removePermissionFromRole(roleId, permissionId) {
        return this.rolePermissionService.removePermissionFromRole(roleId, permissionId);
    }
};
exports.RolePermissionResolver = RolePermissionResolver;
__decorate([
    (0, graphql_1.Query)(() => [role_entity_1.Role], { name: 'adminRoles' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RolePermissionResolver.prototype, "findAllRoles", null);
__decorate([
    (0, graphql_1.Query)(() => role_entity_1.Role, { name: 'adminRole' }),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN', 'SYSTEM_ADMIN'),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RolePermissionResolver.prototype, "findRoleById", null);
__decorate([
    (0, graphql_1.Mutation)(() => role_entity_1.Role),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN'),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [role_permission_input_1.CreateRoleInput]),
    __metadata("design:returntype", Promise)
], RolePermissionResolver.prototype, "createRole", null);
__decorate([
    (0, graphql_1.Mutation)(() => role_entity_1.Role),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN'),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, role_permission_input_1.UpdateRoleInput]),
    __metadata("design:returntype", Promise)
], RolePermissionResolver.prototype, "updateRole", null);
__decorate([
    (0, graphql_1.Mutation)(() => role_entity_1.Role),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN'),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RolePermissionResolver.prototype, "deleteRole", null);
__decorate([
    (0, graphql_1.Mutation)(() => role_entity_1.Role),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [role_permission_input_1.CreateRoleWithPermissionsInput]),
    __metadata("design:returntype", Promise)
], RolePermissionResolver.prototype, "createRoleWithPermissions", null);
__decorate([
    (0, graphql_1.Query)(() => [permission_entity_1.Permission], { name: 'adminPermissions' }),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN', 'SYSTEM_ADMIN'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RolePermissionResolver.prototype, "findAllPermissions", null);
__decorate([
    (0, graphql_1.Query)(() => permission_entity_1.Permission, { name: 'adminPermission' }),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN', 'SYSTEM_ADMIN'),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RolePermissionResolver.prototype, "findPermissionById", null);
__decorate([
    (0, graphql_1.Mutation)(() => permission_entity_1.Permission),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN'),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [role_permission_input_1.CreatePermissionInput]),
    __metadata("design:returntype", Promise)
], RolePermissionResolver.prototype, "createPermission", null);
__decorate([
    (0, graphql_1.Mutation)(() => permission_entity_1.Permission),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN'),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, role_permission_input_1.UpdatePermissionInput]),
    __metadata("design:returntype", Promise)
], RolePermissionResolver.prototype, "updatePermission", null);
__decorate([
    (0, graphql_1.Mutation)(() => permission_entity_1.Permission),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN'),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RolePermissionResolver.prototype, "deletePermission", null);
__decorate([
    (0, graphql_1.Mutation)(() => role_entity_1.Role),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN'),
    __param(0, (0, graphql_1.Args)('roleId', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('permissionId', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], RolePermissionResolver.prototype, "assignPermissionToRole", null);
__decorate([
    (0, graphql_1.Mutation)(() => role_entity_1.Role),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN'),
    __param(0, (0, graphql_1.Args)('roleId', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('permissionId', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], RolePermissionResolver.prototype, "removePermissionFromRole", null);
exports.RolePermissionResolver = RolePermissionResolver = __decorate([
    (0, graphql_1.Resolver)(),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [role_permission_service_1.RolePermissionService])
], RolePermissionResolver);
//# sourceMappingURL=role-permission.resolver.js.map