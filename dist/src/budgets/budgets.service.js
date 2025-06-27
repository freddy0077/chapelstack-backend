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
exports.BudgetsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let BudgetsService = class BudgetsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    create(createBudgetInput) {
        const { fundId, branchId, organisationId, ...rest } = createBudgetInput;
        const data = {
            ...rest,
            fund: { connect: { id: fundId } },
        };
        if (branchId) {
            data.branch = { connect: { id: branchId } };
        }
        if (organisationId) {
            data.organisation = { connect: { id: organisationId } };
        }
        return this.prisma.budget.create({ data });
    }
    findAll(organisationId) {
        return this.prisma.budget.findMany({
            where: { organisationId },
        });
    }
    findOne(id) {
        return this.prisma.budget.findUnique({ where: { id } });
    }
    update(id, updateBudgetInput) {
        const { id: _, fundId, branchId, organisationId, ...rest } = updateBudgetInput;
        const data = { ...rest };
        if (fundId) {
            data.fund = { connect: { id: fundId } };
        }
        if (branchId) {
            data.branch = { connect: { id: branchId } };
        }
        if (organisationId) {
            data.organisation = { connect: { id: organisationId } };
        }
        return this.prisma.budget.update({
            where: { id },
            data,
        });
    }
    remove(id) {
        return this.prisma.budget.delete({ where: { id } });
    }
};
exports.BudgetsService = BudgetsService;
exports.BudgetsService = BudgetsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BudgetsService);
//# sourceMappingURL=budgets.service.js.map