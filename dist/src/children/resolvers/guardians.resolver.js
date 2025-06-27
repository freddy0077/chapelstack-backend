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
exports.GuardiansResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const guardians_service_1 = require("../services/guardians.service");
const children_service_1 = require("../services/children.service");
const guardian_entity_1 = require("../entities/guardian.entity");
const create_guardian_input_1 = require("../dto/create-guardian.input");
const update_guardian_input_1 = require("../dto/update-guardian.input");
const create_child_guardian_relation_input_1 = require("../dto/create-child-guardian-relation.input");
const child_guardian_relation_entity_1 = require("../entities/child-guardian-relation.entity");
const child_entity_1 = require("../entities/child.entity");
const common_1 = require("@nestjs/common");
const gql_auth_guard_1 = require("../../auth/guards/gql-auth.guard");
const permissions_guard_1 = require("../../auth/guards/permissions.guard");
const require_permissions_decorator_1 = require("../../auth/decorators/require-permissions.decorator");
let GuardiansResolver = class GuardiansResolver {
    guardiansService;
    childrenService;
    constructor(guardiansService, childrenService) {
        this.guardiansService = guardiansService;
        this.childrenService = childrenService;
    }
    createGuardian(createGuardianInput) {
        return this.guardiansService.create(createGuardianInput);
    }
    findAll(branchId) {
        return this.guardiansService.findAll(branchId);
    }
    findOne(id) {
        return this.guardiansService.findOne(id);
    }
    updateGuardian(updateGuardianInput) {
        return this.guardiansService.update(updateGuardianInput.id, updateGuardianInput);
    }
    removeGuardian(id) {
        return this.guardiansService.remove(id);
    }
    createChildGuardianRelation(input) {
        return this.guardiansService.createChildGuardianRelation(input);
    }
    removeChildGuardianRelation(childId, guardianId) {
        return this.guardiansService.removeChildGuardianRelation(childId, guardianId);
    }
    async getChildren(guardian) {
        return this.childrenService.findByGuardian(guardian.id);
    }
};
exports.GuardiansResolver = GuardiansResolver;
__decorate([
    (0, graphql_1.Mutation)(() => guardian_entity_1.Guardian),
    (0, require_permissions_decorator_1.RequirePermissions)({ action: 'create', subject: 'Guardian' }),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_guardian_input_1.CreateGuardianInput]),
    __metadata("design:returntype", Promise)
], GuardiansResolver.prototype, "createGuardian", null);
__decorate([
    (0, graphql_1.Query)(() => [guardian_entity_1.Guardian], { name: 'guardians' }),
    (0, require_permissions_decorator_1.RequirePermissions)({ action: 'read', subject: 'Guardian' }),
    __param(0, (0, graphql_1.Args)('branchId', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GuardiansResolver.prototype, "findAll", null);
__decorate([
    (0, graphql_1.Query)(() => guardian_entity_1.Guardian, { name: 'guardian' }),
    (0, require_permissions_decorator_1.RequirePermissions)({ action: 'read', subject: 'Guardian' }),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GuardiansResolver.prototype, "findOne", null);
__decorate([
    (0, graphql_1.Mutation)(() => guardian_entity_1.Guardian),
    (0, require_permissions_decorator_1.RequirePermissions)({ action: 'update', subject: 'Guardian' }),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_guardian_input_1.UpdateGuardianInput]),
    __metadata("design:returntype", Promise)
], GuardiansResolver.prototype, "updateGuardian", null);
__decorate([
    (0, graphql_1.Mutation)(() => guardian_entity_1.Guardian),
    (0, require_permissions_decorator_1.RequirePermissions)({ action: 'delete', subject: 'Guardian' }),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GuardiansResolver.prototype, "removeGuardian", null);
__decorate([
    (0, graphql_1.Mutation)(() => child_guardian_relation_entity_1.ChildGuardianRelation),
    (0, require_permissions_decorator_1.RequirePermissions)({ action: 'create', subject: 'ChildGuardianRelation' }),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_child_guardian_relation_input_1.CreateChildGuardianRelationInput]),
    __metadata("design:returntype", Promise)
], GuardiansResolver.prototype, "createChildGuardianRelation", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    (0, require_permissions_decorator_1.RequirePermissions)({ action: 'delete', subject: 'ChildGuardianRelation' }),
    __param(0, (0, graphql_1.Args)('childId', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('guardianId', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], GuardiansResolver.prototype, "removeChildGuardianRelation", null);
__decorate([
    (0, graphql_1.ResolveField)('children', () => [child_entity_1.Child]),
    __param(0, (0, graphql_1.Parent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [guardian_entity_1.Guardian]),
    __metadata("design:returntype", Promise)
], GuardiansResolver.prototype, "getChildren", null);
exports.GuardiansResolver = GuardiansResolver = __decorate([
    (0, graphql_1.Resolver)(() => guardian_entity_1.Guardian),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [guardians_service_1.GuardiansService,
        children_service_1.ChildrenService])
], GuardiansResolver);
//# sourceMappingURL=guardians.resolver.js.map