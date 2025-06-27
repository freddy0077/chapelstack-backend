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
exports.ContributionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ContributionsService = class ContributionsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    create(createContributionInput) {
        const { contributionTypeId, fundId, paymentMethodId, pledgeId, branchId, organisationId, memberId, ...rest } = createContributionInput;
        const data = {
            ...rest,
            contributionType: { connect: { id: contributionTypeId } },
            fund: { connect: { id: fundId } },
            paymentMethod: { connect: { id: paymentMethodId } },
        };
        if (pledgeId) {
            data.pledge = { connect: { id: pledgeId } };
        }
        if (branchId) {
            data.branch = { connect: { id: branchId } };
        }
        if (organisationId) {
            data.organisation = { connect: { id: organisationId } };
        }
        if (memberId) {
            data.member = { connect: { id: memberId } };
        }
        return this.prisma.contribution.create({ data });
    }
    findAll(organisationId) {
        return this.prisma.contribution.findMany({
            where: { organisationId },
        });
    }
    findOne(id) {
        return this.prisma.contribution.findUnique({ where: { id } });
    }
    update(id, updateContributionInput) {
        const { id: _, contributionTypeId, fundId, paymentMethodId, pledgeId, branchId, organisationId, memberId, ...rest } = updateContributionInput;
        const data = { ...rest };
        if (contributionTypeId) {
            data.contributionType = { connect: { id: contributionTypeId } };
        }
        if (fundId) {
            data.fund = { connect: { id: fundId } };
        }
        if (paymentMethodId) {
            data.paymentMethod = { connect: { id: paymentMethodId } };
        }
        if (pledgeId) {
            data.pledge = { connect: { id: pledgeId } };
        }
        if (branchId) {
            data.branch = { connect: { id: branchId } };
        }
        if (organisationId) {
            data.organisation = { connect: { id: organisationId } };
        }
        if (memberId) {
            data.member = { connect: { id: memberId } };
        }
        return this.prisma.contribution.update({ where: { id }, data });
    }
    remove(id) {
        return this.prisma.contribution.delete({ where: { id } });
    }
};
exports.ContributionsService = ContributionsService;
exports.ContributionsService = ContributionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ContributionsService);
//# sourceMappingURL=contributions.service.js.map