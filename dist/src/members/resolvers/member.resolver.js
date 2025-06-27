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
exports.MemberResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const member_entity_1 = require("../entities/member.entity");
const family_entity_1 = require("../entities/family.entity");
const families_service_1 = require("../services/families.service");
const prisma_service_1 = require("../../prisma/prisma.service");
let MemberResolver = class MemberResolver {
    familiesService;
    prisma;
    constructor(familiesService, prisma) {
        this.familiesService = familiesService;
        this.prisma = prisma;
    }
    async families(member) {
        return this.familiesService.findFamiliesByMemberId(member.id);
    }
    async branch(member) {
        if (!member.branchId)
            return null;
        return this.prisma.branch.findUnique({ where: { id: member.branchId } });
    }
    async spouse(member) {
        if (!member.spouseId)
            return null;
        return this.prisma.member.findUnique({ where: { id: member.spouseId } });
    }
    async parent(member) {
        if (!member.parentId)
            return null;
        return this.prisma.member.findUnique({ where: { id: member.parentId } });
    }
};
exports.MemberResolver = MemberResolver;
__decorate([
    (0, graphql_1.ResolveField)(() => [family_entity_1.Family], { nullable: true }),
    __param(0, (0, graphql_1.Parent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [member_entity_1.Member]),
    __metadata("design:returntype", Promise)
], MemberResolver.prototype, "families", null);
__decorate([
    (0, graphql_1.ResolveField)(() => Object, { nullable: true }),
    __param(0, (0, graphql_1.Parent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [member_entity_1.Member]),
    __metadata("design:returntype", Promise)
], MemberResolver.prototype, "branch", null);
__decorate([
    (0, graphql_1.ResolveField)(() => Object, { nullable: true }),
    __param(0, (0, graphql_1.Parent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [member_entity_1.Member]),
    __metadata("design:returntype", Promise)
], MemberResolver.prototype, "spouse", null);
__decorate([
    (0, graphql_1.ResolveField)(() => Object, { nullable: true }),
    __param(0, (0, graphql_1.Parent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [member_entity_1.Member]),
    __metadata("design:returntype", Promise)
], MemberResolver.prototype, "parent", null);
exports.MemberResolver = MemberResolver = __decorate([
    (0, graphql_1.Resolver)(() => member_entity_1.Member),
    __metadata("design:paramtypes", [families_service_1.FamiliesService,
        prisma_service_1.PrismaService])
], MemberResolver);
//# sourceMappingURL=member.resolver.js.map