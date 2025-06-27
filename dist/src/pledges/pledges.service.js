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
exports.PledgesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PledgesService = class PledgesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    create(createPledgeInput) {
        const { fundId, memberId, branchId, organisationId, ...rest } = createPledgeInput;
        const data = {
            ...rest,
            fund: { connect: { id: fundId } },
            member: { connect: { id: memberId } },
        };
        if (branchId) {
            data.branch = { connect: { id: branchId } };
        }
        if (organisationId) {
            data.organisation = { connect: { id: organisationId } };
        }
        return this.prisma.pledge.create({ data });
    }
    findAll(organisationId) {
        return this.prisma.pledge.findMany({
            where: { organisationId },
        });
    }
    findOne(id) {
        return this.prisma.pledge.findUnique({ where: { id } });
    }
    update(id, updatePledgeInput) {
        const { id: _, fundId, memberId, branchId, organisationId, ...rest } = updatePledgeInput;
        const data = { ...rest };
        if (fundId) {
            data.fund = { connect: { id: fundId } };
        }
        if (memberId) {
            data.member = { connect: { id: memberId } };
        }
        if (branchId) {
            data.branch = { connect: { id: branchId } };
        }
        if (organisationId) {
            data.organisation = { connect: { id: organisationId } };
        }
        return this.prisma.pledge.update({
            where: { id },
            data,
        });
    }
    remove(id) {
        return this.prisma.pledge.delete({ where: { id } });
    }
};
exports.PledgesService = PledgesService;
exports.PledgesService = PledgesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PledgesService);
//# sourceMappingURL=pledges.service.js.map