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
exports.ContributionsResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const contributions_service_1 = require("./contributions.service");
const contribution_entity_1 = require("./entities/contribution.entity");
const create_contribution_input_1 = require("./dto/create-contribution.input");
const update_contribution_input_1 = require("./dto/update-contribution.input");
const prisma_service_1 = require("../prisma/prisma.service");
const contribution_type_entity_1 = require("../contribution-types/contribution-type.entity");
const payment_method_entity_1 = require("../payment-methods/payment-method.entity");
const fund_entity_1 = require("../funds/entities/fund.entity");
const member_entity_1 = require("../members/entities/member.entity");
let ContributionsResolver = class ContributionsResolver {
    contributionsService;
    prisma;
    constructor(contributionsService, prisma) {
        this.contributionsService = contributionsService;
        this.prisma = prisma;
    }
    createContribution(createContributionInput) {
        return this.contributionsService.create(createContributionInput);
    }
    findAll(organisationId) {
        return this.contributionsService.findAll(organisationId);
    }
    findOne(id) {
        return this.contributionsService.findOne(id);
    }
    updateContribution(updateContributionInput) {
        return this.contributionsService.update(updateContributionInput.id, updateContributionInput);
    }
    removeContribution(id) {
        return this.contributionsService.remove(id);
    }
    getContributionType(contribution) {
        return this.prisma.contributionType.findUnique({ where: { id: contribution.contributionTypeId } });
    }
    getPaymentMethod(contribution) {
        return this.prisma.paymentMethod.findUnique({ where: { id: contribution.paymentMethodId } });
    }
    getFund(contribution) {
        return this.prisma.fund.findUnique({ where: { id: contribution.fundId } });
    }
    getMember(contribution) {
        if (!contribution.memberId) {
            return null;
        }
        return this.prisma.member.findUnique({ where: { id: contribution.memberId } });
    }
};
exports.ContributionsResolver = ContributionsResolver;
__decorate([
    (0, graphql_1.Mutation)(() => contribution_entity_1.Contribution),
    __param(0, (0, graphql_1.Args)('createContributionInput')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_contribution_input_1.CreateContributionInput]),
    __metadata("design:returntype", void 0)
], ContributionsResolver.prototype, "createContribution", null);
__decorate([
    (0, graphql_1.Query)(() => [contribution_entity_1.Contribution], { name: 'contributions' }),
    __param(0, (0, graphql_1.Args)('organisationId', { type: () => String, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ContributionsResolver.prototype, "findAll", null);
__decorate([
    (0, graphql_1.Query)(() => contribution_entity_1.Contribution, { name: 'contribution' }),
    __param(0, (0, graphql_1.Args)('id', { type: () => String })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ContributionsResolver.prototype, "findOne", null);
__decorate([
    (0, graphql_1.Mutation)(() => contribution_entity_1.Contribution),
    __param(0, (0, graphql_1.Args)('updateContributionInput')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_contribution_input_1.UpdateContributionInput]),
    __metadata("design:returntype", void 0)
], ContributionsResolver.prototype, "updateContribution", null);
__decorate([
    (0, graphql_1.Mutation)(() => contribution_entity_1.Contribution),
    __param(0, (0, graphql_1.Args)('id', { type: () => String })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ContributionsResolver.prototype, "removeContribution", null);
__decorate([
    (0, graphql_1.ResolveField)('contributionType', () => contribution_type_entity_1.ContributionType),
    __param(0, (0, graphql_1.Parent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [contribution_entity_1.Contribution]),
    __metadata("design:returntype", void 0)
], ContributionsResolver.prototype, "getContributionType", null);
__decorate([
    (0, graphql_1.ResolveField)('paymentMethod', () => payment_method_entity_1.PaymentMethod),
    __param(0, (0, graphql_1.Parent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [contribution_entity_1.Contribution]),
    __metadata("design:returntype", void 0)
], ContributionsResolver.prototype, "getPaymentMethod", null);
__decorate([
    (0, graphql_1.ResolveField)('fund', () => fund_entity_1.Fund),
    __param(0, (0, graphql_1.Parent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [contribution_entity_1.Contribution]),
    __metadata("design:returntype", void 0)
], ContributionsResolver.prototype, "getFund", null);
__decorate([
    (0, graphql_1.ResolveField)('member', () => member_entity_1.Member, { nullable: true }),
    __param(0, (0, graphql_1.Parent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [contribution_entity_1.Contribution]),
    __metadata("design:returntype", void 0)
], ContributionsResolver.prototype, "getMember", null);
exports.ContributionsResolver = ContributionsResolver = __decorate([
    (0, graphql_1.Resolver)(() => contribution_entity_1.Contribution),
    __metadata("design:paramtypes", [contributions_service_1.ContributionsService,
        prisma_service_1.PrismaService])
], ContributionsResolver);
//# sourceMappingURL=contributions.resolver.js.map