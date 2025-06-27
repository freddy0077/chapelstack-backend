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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MinistryRoleGuard = exports.MinistryRoles = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const graphql_1 = require("@nestjs/graphql");
const prisma_service_1 = require("../../prisma/prisma.service");
require("reflect-metadata");
const MinistryRoles = (...roles) => {
    return (target, key, descriptor) => {
        if (descriptor) {
            Reflect.defineMetadata('ministryRoles', roles, descriptor.value);
        }
        return descriptor;
    };
};
exports.MinistryRoles = MinistryRoles;
let MinistryRoleGuard = class MinistryRoleGuard {
    reflector;
    prisma;
    constructor(reflector, prisma) {
        this.reflector = reflector;
        this.prisma = prisma;
    }
    async canActivate(context) {
        const requiredRoles = this.reflector.get('ministryRoles', context.getHandler());
        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }
        const ctx = graphql_1.GqlExecutionContext.create(context);
        const { req } = ctx.getContext();
        const user = req.user;
        if (!user) {
            throw new common_1.ForbiddenException('You must be logged in to perform this action');
        }
        const args = ctx.getArgs();
        const ministryId = args.input?.ministryId || args.ministryId;
        const smallGroupId = args.input?.smallGroupId || args.smallGroupId;
        if (!ministryId && !smallGroupId) {
            return false;
        }
        if (ministryId) {
            const memberRole = await this.prisma.groupMember.findFirst({
                where: {
                    ministryId,
                    memberId: user.memberId,
                },
            });
            if (!memberRole || !requiredRoles.includes(memberRole.role)) {
                throw new common_1.ForbiddenException('You do not have the required role to perform this action');
            }
        }
        if (smallGroupId) {
            const memberRole = await this.prisma.groupMember.findFirst({
                where: {
                    smallGroupId,
                    memberId: user.memberId,
                },
            });
            if (!memberRole || !requiredRoles.includes(memberRole.role)) {
                throw new common_1.ForbiddenException('You do not have the required role to perform this action');
            }
        }
        return true;
    }
};
exports.MinistryRoleGuard = MinistryRoleGuard;
exports.MinistryRoleGuard = MinistryRoleGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        prisma_service_1.PrismaService])
], MinistryRoleGuard);
//# sourceMappingURL=ministry-role.guard.js.map