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
exports.PermissionResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const permission_entity_1 = require("../entities/permission.entity");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let PermissionResolver = class PermissionResolver {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async permissionsGroupedBySubject() {
        const permissions = await this.prisma.permission.findMany();
        const grouped = {};
        for (const perm of permissions) {
            const safePerm = { ...perm, description: perm.description ?? undefined };
            if (!grouped[perm.subject])
                grouped[perm.subject] = [];
            grouped[perm.subject].push(safePerm);
        }
        return Object.values(grouped);
    }
};
exports.PermissionResolver = PermissionResolver;
__decorate([
    (0, graphql_1.Query)(() => [[permission_entity_1.Permission]], { name: 'permissionsGroupedBySubject' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PermissionResolver.prototype, "permissionsGroupedBySubject", null);
exports.PermissionResolver = PermissionResolver = __decorate([
    (0, graphql_1.Resolver)(() => permission_entity_1.Permission),
    __param(0, (0, common_1.Inject)(prisma_service_1.PrismaService)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PermissionResolver);
//# sourceMappingURL=permission.resolver.js.map