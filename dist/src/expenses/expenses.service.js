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
exports.ExpensesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ExpensesService = class ExpensesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    create(createExpenseInput) {
        const { expenseCategoryId, fundId, paymentMethodId, vendorId, budgetId, branchId, organisationId, ...rest } = createExpenseInput;
        const data = {
            ...rest,
            expenseCategory: { connect: { id: expenseCategoryId } },
            fund: { connect: { id: fundId } },
            paymentMethod: { connect: { id: paymentMethodId } },
        };
        if (vendorId) {
            data.vendor = { connect: { id: vendorId } };
        }
        if (budgetId) {
            data.budget = { connect: { id: budgetId } };
        }
        if (branchId) {
            data.branch = { connect: { id: branchId } };
        }
        if (organisationId) {
            data.organisation = { connect: { id: organisationId } };
        }
        return this.prisma.expense.create({ data });
    }
    findAll(organisationId) {
        return this.prisma.expense.findMany({
            where: { organisationId },
        });
    }
    findOne(id) {
        return this.prisma.expense.findUnique({ where: { id } });
    }
    update(id, updateExpenseInput) {
        const { id: _, expenseCategoryId, fundId, paymentMethodId, vendorId, budgetId, branchId, organisationId, ...rest } = updateExpenseInput;
        const data = { ...rest };
        if (expenseCategoryId) {
            data.expenseCategory = { connect: { id: expenseCategoryId } };
        }
        if (fundId) {
            data.fund = { connect: { id: fundId } };
        }
        if (paymentMethodId) {
            data.paymentMethod = { connect: { id: paymentMethodId } };
        }
        if (vendorId) {
            data.vendor = { connect: { id: vendorId } };
        }
        if (budgetId) {
            data.budget = { connect: { id: budgetId } };
        }
        if (branchId) {
            data.branch = { connect: { id: branchId } };
        }
        if (organisationId) {
            data.organisation = { connect: { id: organisationId } };
        }
        return this.prisma.expense.update({
            where: { id },
            data,
        });
    }
    remove(id) {
        return this.prisma.expense.delete({ where: { id } });
    }
};
exports.ExpensesService = ExpensesService;
exports.ExpensesService = ExpensesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ExpensesService);
//# sourceMappingURL=expenses.service.js.map