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
exports.ChildrenResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const children_service_1 = require("../services/children.service");
const guardians_service_1 = require("../services/guardians.service");
const child_entity_1 = require("../entities/child.entity");
const create_child_input_1 = require("../dto/create-child.input");
const update_child_input_1 = require("../dto/update-child.input");
const child_filter_input_1 = require("../dto/child-filter.input");
const guardian_entity_1 = require("../entities/guardian.entity");
const check_in_record_entity_1 = require("../entities/check-in-record.entity");
const common_1 = require("@nestjs/common");
const gql_auth_guard_1 = require("../../auth/guards/gql-auth.guard");
const permissions_guard_1 = require("../../auth/guards/permissions.guard");
const require_permissions_decorator_1 = require("../../auth/decorators/require-permissions.decorator");
let ChildrenResolver = class ChildrenResolver {
    childrenService;
    guardiansService;
    constructor(childrenService, guardiansService) {
        this.childrenService = childrenService;
        this.guardiansService = guardiansService;
    }
    async createChild(createChildInput) {
        try {
            return await this.childrenService.create(createChildInput);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Failed to create child: ${errorMessage}`);
        }
    }
    async findAll(filter) {
        try {
            return await this.childrenService.findAll(filter);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Failed to find children: ${errorMessage}`);
        }
    }
    async findOne(id) {
        try {
            return await this.childrenService.findOne(id);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Failed to find child: ${errorMessage}`);
        }
    }
    async updateChild(updateChildInput) {
        try {
            return await this.childrenService.update(updateChildInput.id, updateChildInput);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Failed to update child: ${errorMessage}`);
        }
    }
    async removeChild(id) {
        try {
            return await this.childrenService.remove(id);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Failed to remove child: ${errorMessage}`);
        }
    }
    async getGuardians(child) {
        return this.guardiansService.findByChild(child.id);
    }
    async recentCheckIns(child) {
        try {
            const checkIns = await this.childrenService.getRecentCheckIns(child.id);
            return checkIns;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Failed to get recent check-ins: ${errorMessage}`);
        }
    }
};
exports.ChildrenResolver = ChildrenResolver;
__decorate([
    (0, graphql_1.Mutation)(() => child_entity_1.Child),
    (0, require_permissions_decorator_1.RequirePermissions)({ action: 'create', subject: 'Child' }),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_child_input_1.CreateChildInput]),
    __metadata("design:returntype", Promise)
], ChildrenResolver.prototype, "createChild", null);
__decorate([
    (0, graphql_1.Query)(() => [child_entity_1.Child], { name: 'children' }),
    (0, require_permissions_decorator_1.RequirePermissions)({ action: 'read', subject: 'Child' }),
    __param(0, (0, graphql_1.Args)('filter', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [child_filter_input_1.ChildFilterInput]),
    __metadata("design:returntype", Promise)
], ChildrenResolver.prototype, "findAll", null);
__decorate([
    (0, graphql_1.Query)(() => child_entity_1.Child, { name: 'child' }),
    (0, require_permissions_decorator_1.RequirePermissions)({ action: 'read', subject: 'Child' }),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChildrenResolver.prototype, "findOne", null);
__decorate([
    (0, graphql_1.Mutation)(() => child_entity_1.Child),
    (0, require_permissions_decorator_1.RequirePermissions)({ action: 'update', subject: 'Child' }),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_child_input_1.UpdateChildInput]),
    __metadata("design:returntype", Promise)
], ChildrenResolver.prototype, "updateChild", null);
__decorate([
    (0, graphql_1.Mutation)(() => child_entity_1.Child),
    (0, require_permissions_decorator_1.RequirePermissions)({ action: 'delete', subject: 'Child' }),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChildrenResolver.prototype, "removeChild", null);
__decorate([
    (0, graphql_1.ResolveField)('guardians', () => [guardian_entity_1.Guardian]),
    __param(0, (0, graphql_1.Parent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [child_entity_1.Child]),
    __metadata("design:returntype", Promise)
], ChildrenResolver.prototype, "getGuardians", null);
__decorate([
    (0, graphql_1.ResolveField)('recentCheckIns', () => [check_in_record_entity_1.CheckInRecord]),
    __param(0, (0, graphql_1.Parent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [child_entity_1.Child]),
    __metadata("design:returntype", Promise)
], ChildrenResolver.prototype, "recentCheckIns", null);
exports.ChildrenResolver = ChildrenResolver = __decorate([
    (0, graphql_1.Resolver)(() => child_entity_1.Child),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [children_service_1.ChildrenService,
        guardians_service_1.GuardiansService])
], ChildrenResolver);
//# sourceMappingURL=children.resolver.js.map