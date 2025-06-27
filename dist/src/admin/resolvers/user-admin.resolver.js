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
exports.UserAdminResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const user_admin_service_1 = require("../services/user-admin.service");
const user_entity_1 = require("../../auth/entities/user.entity");
const common_1 = require("@nestjs/common");
const gql_auth_guard_1 = require("../../auth/guards/gql-auth.guard");
const roles_guard_1 = require("../../auth/guards/roles.guard");
const roles_decorator_1 = require("../../auth/decorators/roles.decorator");
const pagination_input_1 = require("../../common/dto/pagination.input");
const user_filter_input_1 = require("../dto/user-filter.input");
const paginated_users_entity_1 = require("../entities/paginated-users.entity");
const user_branch_entity_1 = require("../../auth/entities/user-branch.entity");
const create_branch_admin_input_1 = require("../dto/create-branch-admin.input");
let UserAdminResolver = class UserAdminResolver {
    userAdminService;
    constructor(userAdminService) {
        this.userAdminService = userAdminService;
    }
    async createBranchAdmin(input) {
        const user = await this.userAdminService.createUser({
            email: input.email,
            password: input.password,
            firstName: input.firstName,
            lastName: input.lastName,
            isActive: true,
            organisationId: input.organisationId,
        });
        const branchAdminRoleId = await this.userAdminService.getBranchAdminRoleId();
        await this.userAdminService.assignRoleToUser(user.id, branchAdminRoleId);
        const userBranch = await this.userAdminService.assignBranchRoleToUser(user.id, input.branchId, branchAdminRoleId);
        return {
            ...userBranch,
            branchId: userBranch.branchId ?? undefined,
            branch: userBranch.branch ?? undefined,
        };
    }
    async findAllUsers(paginationInput = { skip: 0, take: 10 }, filterInput) {
        return this.userAdminService.findAllUsers(paginationInput, filterInput);
    }
    async findUserById(id) {
        return this.userAdminService.findUserById(id);
    }
    async updateUserActiveStatus(id, isActive) {
        return this.userAdminService.updateUserActiveStatus(id, isActive);
    }
    async assignRoleToUser(userId, roleId) {
        return this.userAdminService.assignRoleToUser(userId, roleId);
    }
    async removeRoleFromUser(userId, roleId) {
        return this.userAdminService.removeRoleFromUser(userId, roleId);
    }
    async assignBranchRoleToUser(userId, branchId, roleId, assignedBy) {
        const userBranch = await this.userAdminService.assignBranchRoleToUser(userId, branchId, roleId, assignedBy);
        return {
            ...userBranch,
            branchId: userBranch.branchId ?? undefined,
            branch: userBranch.branch ?? undefined,
        };
    }
    async removeBranchRoleFromUser(userId, branchId, roleId) {
        return this.userAdminService.removeBranchRoleFromUser(userId, branchId, roleId);
    }
};
exports.UserAdminResolver = UserAdminResolver;
__decorate([
    (0, graphql_1.Mutation)(() => user_branch_entity_1.UserBranch),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_branch_admin_input_1.CreateBranchAdminInput]),
    __metadata("design:returntype", Promise)
], UserAdminResolver.prototype, "createBranchAdmin", null);
__decorate([
    (0, graphql_1.Query)(() => paginated_users_entity_1.PaginatedUsers, { name: 'adminUsers' }),
    __param(0, (0, graphql_1.Args)('pagination', { nullable: true })),
    __param(1, (0, graphql_1.Args)('filter', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_input_1.PaginationInput,
        user_filter_input_1.UserFilterInput]),
    __metadata("design:returntype", Promise)
], UserAdminResolver.prototype, "findAllUsers", null);
__decorate([
    (0, graphql_1.Query)(() => user_entity_1.User, { name: 'adminUser' }),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN', 'SYSTEM_ADMIN', 'BRANCH_ADMIN'),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserAdminResolver.prototype, "findUserById", null);
__decorate([
    (0, graphql_1.Mutation)(() => user_entity_1.User),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN', 'SYSTEM_ADMIN'),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('isActive')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean]),
    __metadata("design:returntype", Promise)
], UserAdminResolver.prototype, "updateUserActiveStatus", null);
__decorate([
    (0, graphql_1.Mutation)(() => user_entity_1.User),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN', 'SYSTEM_ADMIN'),
    __param(0, (0, graphql_1.Args)('userId', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('roleId', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], UserAdminResolver.prototype, "assignRoleToUser", null);
__decorate([
    (0, graphql_1.Mutation)(() => user_entity_1.User),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN', 'SYSTEM_ADMIN'),
    __param(0, (0, graphql_1.Args)('userId', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('roleId', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], UserAdminResolver.prototype, "removeRoleFromUser", null);
__decorate([
    (0, graphql_1.Mutation)(() => user_branch_entity_1.UserBranch),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN', 'SYSTEM_ADMIN', 'BRANCH_ADMIN'),
    __param(0, (0, graphql_1.Args)('userId', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('branchId', { type: () => graphql_1.ID })),
    __param(2, (0, graphql_1.Args)('roleId', { type: () => graphql_1.ID })),
    __param(3, (0, graphql_1.Args)('assignedBy', { type: () => graphql_1.ID, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], UserAdminResolver.prototype, "assignBranchRoleToUser", null);
__decorate([
    (0, graphql_1.Mutation)(() => user_branch_entity_1.UserBranch),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN', 'SYSTEM_ADMIN', 'BRANCH_ADMIN'),
    __param(0, (0, graphql_1.Args)('userId', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('branchId', { type: () => graphql_1.ID })),
    __param(2, (0, graphql_1.Args)('roleId', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], UserAdminResolver.prototype, "removeBranchRoleFromUser", null);
exports.UserAdminResolver = UserAdminResolver = __decorate([
    (0, graphql_1.Resolver)(),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [user_admin_service_1.UserAdminService])
], UserAdminResolver);
//# sourceMappingURL=user-admin.resolver.js.map