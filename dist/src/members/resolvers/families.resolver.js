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
exports.FamiliesResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const families_service_1 = require("../services/families.service");
const family_entity_1 = require("../entities/family.entity");
const create_family_input_1 = require("../dto/create-family.input");
const update_family_input_1 = require("../dto/update-family.input");
const create_family_relationship_input_1 = require("../dto/create-family-relationship.input");
const update_family_relationship_input_1 = require("../dto/update-family-relationship.input");
const common_1 = require("@nestjs/common");
const current_user_decorator_1 = require("../../auth/decorators/current-user.decorator");
const decorators_1 = require("../../common/decorators");
let FamiliesResolver = class FamiliesResolver {
    familiesService;
    constructor(familiesService) {
        this.familiesService = familiesService;
    }
    async createFamily(createFamilyInput, userId, ipAddress, userAgent) {
        return this.familiesService.createFamily(createFamilyInput, userId, ipAddress, userAgent);
    }
    async findAllFamilies(skip, take) {
        return this.familiesService.findAllFamilies(skip, take);
    }
    async findFamilyById(id) {
        return this.familiesService.findFamilyById(id);
    }
    async updateFamily(id, updateFamilyInput, userId, ipAddress, userAgent) {
        return this.familiesService.updateFamily(id, updateFamilyInput, userId, ipAddress, userAgent);
    }
    async removeFamily(id, userId, ipAddress, userAgent) {
        return this.familiesService.removeFamily(id, userId, ipAddress, userAgent);
    }
    async addMemberToFamily(familyId, memberId, userId, ipAddress, userAgent) {
        return this.familiesService.addMemberToFamily(familyId, memberId, userId, ipAddress, userAgent);
    }
    async removeMemberFromFamily(familyId, memberId, userId, ipAddress, userAgent) {
        return this.familiesService.removeMemberFromFamily(familyId, memberId, userId, ipAddress, userAgent);
    }
    async countFamilies() {
        return this.familiesService.countFamilies();
    }
    async createFamilyRelationship(createFamilyRelationshipInput, userId, ipAddress, userAgent) {
        return this.familiesService.createFamilyRelationship(createFamilyRelationshipInput, userId, ipAddress, userAgent);
    }
    async findAllFamilyRelationships(skip, take) {
        return this.familiesService.findAllFamilyRelationships(skip, take);
    }
    async findFamilyRelationshipById(id) {
        return this.familiesService.findFamilyRelationshipById(id);
    }
    async findFamilyRelationshipsByMember(memberId) {
        return this.familiesService.findFamilyRelationshipsByMember(memberId);
    }
    async updateFamilyRelationship(id, updateFamilyRelationshipInput, userId, ipAddress, userAgent) {
        return this.familiesService.updateFamilyRelationship(id, updateFamilyRelationshipInput, userId, ipAddress, userAgent);
    }
    async removeFamilyRelationship(id, userId, ipAddress, userAgent) {
        return this.familiesService.removeFamilyRelationship(id, userId, ipAddress, userAgent);
    }
    async countFamilyRelationships() {
        return this.familiesService.countFamilyRelationships();
    }
    async addMemberToFamilyByRfidCard(rfidCardId, familyId, relatedMemberId, relationship, userId, ipAddress, userAgent) {
        return this.familiesService.addMemberToFamilyByRfidCard(rfidCardId, familyId, relatedMemberId, relationship, userId, ipAddress, userAgent);
    }
};
exports.FamiliesResolver = FamiliesResolver;
__decorate([
    (0, graphql_1.Mutation)(() => family_entity_1.Family),
    __param(0, (0, graphql_1.Args)('createFamilyInput')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, decorators_1.IpAddress)()),
    __param(3, (0, decorators_1.UserAgent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_family_input_1.CreateFamilyInput, String, String, String]),
    __metadata("design:returntype", Promise)
], FamiliesResolver.prototype, "createFamily", null);
__decorate([
    (0, graphql_1.Query)(() => [family_entity_1.Family], { name: 'families' }),
    __param(0, (0, graphql_1.Args)('skip', { type: () => graphql_1.Int, nullable: true, defaultValue: 0 })),
    __param(1, (0, graphql_1.Args)('take', { type: () => graphql_1.Int, nullable: true, defaultValue: 10 })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], FamiliesResolver.prototype, "findAllFamilies", null);
__decorate([
    (0, graphql_1.Query)(() => family_entity_1.Family, { name: 'family' }),
    __param(0, (0, graphql_1.Args)('id', { type: () => String }, common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FamiliesResolver.prototype, "findFamilyById", null);
__decorate([
    (0, graphql_1.Mutation)(() => family_entity_1.Family),
    __param(0, (0, graphql_1.Args)('id', { type: () => String }, common_1.ParseUUIDPipe)),
    __param(1, (0, graphql_1.Args)('updateFamilyInput')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __param(3, (0, decorators_1.IpAddress)()),
    __param(4, (0, decorators_1.UserAgent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_family_input_1.UpdateFamilyInput, String, String, String]),
    __metadata("design:returntype", Promise)
], FamiliesResolver.prototype, "updateFamily", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    __param(0, (0, graphql_1.Args)('id', { type: () => String }, common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, decorators_1.IpAddress)()),
    __param(3, (0, decorators_1.UserAgent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], FamiliesResolver.prototype, "removeFamily", null);
__decorate([
    (0, graphql_1.Mutation)(() => family_entity_1.Family),
    __param(0, (0, graphql_1.Args)('familyId', { type: () => String }, common_1.ParseUUIDPipe)),
    __param(1, (0, graphql_1.Args)('memberId', { type: () => String }, common_1.ParseUUIDPipe)),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __param(3, (0, decorators_1.IpAddress)()),
    __param(4, (0, decorators_1.UserAgent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], FamiliesResolver.prototype, "addMemberToFamily", null);
__decorate([
    (0, graphql_1.Mutation)(() => family_entity_1.Family),
    __param(0, (0, graphql_1.Args)('familyId', { type: () => String }, common_1.ParseUUIDPipe)),
    __param(1, (0, graphql_1.Args)('memberId', { type: () => String }, common_1.ParseUUIDPipe)),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __param(3, (0, decorators_1.IpAddress)()),
    __param(4, (0, decorators_1.UserAgent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], FamiliesResolver.prototype, "removeMemberFromFamily", null);
__decorate([
    (0, graphql_1.Query)(() => graphql_1.Int, { name: 'familiesCount' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FamiliesResolver.prototype, "countFamilies", null);
__decorate([
    (0, graphql_1.Mutation)(() => family_entity_1.FamilyRelationship),
    __param(0, (0, graphql_1.Args)('createFamilyRelationshipInput')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, decorators_1.IpAddress)()),
    __param(3, (0, decorators_1.UserAgent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_family_relationship_input_1.CreateFamilyRelationshipInput, String, String, String]),
    __metadata("design:returntype", Promise)
], FamiliesResolver.prototype, "createFamilyRelationship", null);
__decorate([
    (0, graphql_1.Query)(() => [family_entity_1.FamilyRelationship], { name: 'familyRelationships' }),
    __param(0, (0, graphql_1.Args)('skip', { type: () => graphql_1.Int, nullable: true, defaultValue: 0 })),
    __param(1, (0, graphql_1.Args)('take', { type: () => graphql_1.Int, nullable: true, defaultValue: 10 })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], FamiliesResolver.prototype, "findAllFamilyRelationships", null);
__decorate([
    (0, graphql_1.Query)(() => family_entity_1.FamilyRelationship, { name: 'familyRelationship' }),
    __param(0, (0, graphql_1.Args)('id', { type: () => String }, common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FamiliesResolver.prototype, "findFamilyRelationshipById", null);
__decorate([
    (0, graphql_1.Query)(() => [family_entity_1.FamilyRelationship], { name: 'familyRelationshipsByMember' }),
    __param(0, (0, graphql_1.Args)('memberId', { type: () => String }, common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FamiliesResolver.prototype, "findFamilyRelationshipsByMember", null);
__decorate([
    (0, graphql_1.Mutation)(() => family_entity_1.FamilyRelationship),
    __param(0, (0, graphql_1.Args)('id', { type: () => String }, common_1.ParseUUIDPipe)),
    __param(1, (0, graphql_1.Args)('updateFamilyRelationshipInput')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __param(3, (0, decorators_1.IpAddress)()),
    __param(4, (0, decorators_1.UserAgent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_family_relationship_input_1.UpdateFamilyRelationshipInput, String, String, String]),
    __metadata("design:returntype", Promise)
], FamiliesResolver.prototype, "updateFamilyRelationship", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    __param(0, (0, graphql_1.Args)('id', { type: () => String }, common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, decorators_1.IpAddress)()),
    __param(3, (0, decorators_1.UserAgent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], FamiliesResolver.prototype, "removeFamilyRelationship", null);
__decorate([
    (0, graphql_1.Query)(() => graphql_1.Int, { name: 'familyRelationshipsCount' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FamiliesResolver.prototype, "countFamilyRelationships", null);
__decorate([
    (0, graphql_1.Mutation)(() => family_entity_1.Family),
    __param(0, (0, graphql_1.Args)('rfidCardId', { type: () => String })),
    __param(1, (0, graphql_1.Args)('familyId', { type: () => String })),
    __param(2, (0, graphql_1.Args)('relatedMemberId', { type: () => String })),
    __param(3, (0, graphql_1.Args)('relationship', { type: () => String })),
    __param(4, (0, current_user_decorator_1.CurrentUser)()),
    __param(5, (0, decorators_1.IpAddress)()),
    __param(6, (0, decorators_1.UserAgent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], FamiliesResolver.prototype, "addMemberToFamilyByRfidCard", null);
exports.FamiliesResolver = FamiliesResolver = __decorate([
    (0, graphql_1.Resolver)(() => family_entity_1.Family),
    __metadata("design:paramtypes", [families_service_1.FamiliesService])
], FamiliesResolver);
//# sourceMappingURL=families.resolver.js.map