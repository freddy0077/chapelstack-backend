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
var FinancialReportsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinancialReportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let FinancialReportsService = FinancialReportsService_1 = class FinancialReportsService {
    prisma;
    logger = new common_1.Logger(FinancialReportsService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getContributionsReport(filters) {
        try {
            const { branchId, organisationId, dateRange, fundId, } = filters;
            const where = {};
            if (branchId) {
                where.branchId = branchId;
            }
            if (organisationId) {
                where.organisationId = organisationId;
            }
            if (fundId) {
                where.fundId = fundId;
            }
            if (dateRange?.startDate && dateRange?.endDate) {
                where.date = {
                    gte: new Date(dateRange.startDate),
                    lte: new Date(dateRange.endDate),
                };
            }
            const contributions = await this.prisma.contribution.findMany({
                where,
                include: {
                    member: true,
                    fund: true,
                    paymentMethod: true,
                    batch: true,
                },
            });
            const total = contributions.reduce((sum, c) => sum + c.amount, 0);
            const contributionEntities = contributions.map(c => ({
                id: c.id,
                amount: c.amount,
                date: c.date,
                contributionTypeId: c.contributionTypeId,
                paymentMethodId: c.paymentMethodId,
                notes: c.notes || undefined,
                memberId: c.memberId || undefined,
                anonymous: c.isAnonymous || undefined,
                fundId: c.fundId,
                pledgeId: c.pledgeId || undefined,
                branchId: c.branchId || undefined,
                organisationId: c.organisationId || undefined,
            }));
            return {
                contributions: contributionEntities,
                total,
                count: contributions.length,
            };
        }
        catch (error) {
            this.logger.error('Failed to get contributions report', error.stack);
            throw new Error('Could not retrieve contributions report.');
        }
    }
    async getBudgetVsActualReport(filter) {
        try {
            const { branchId, organisationId, dateRange } = filter;
            const budgetWhere = {};
            if (branchId) {
                budgetWhere.branchId = branchId;
            }
            if (organisationId) {
                budgetWhere.organisationId = organisationId;
            }
            if (dateRange?.startDate && dateRange?.endDate) {
                budgetWhere.OR = [
                    {
                        startDate: {
                            lte: new Date(dateRange.endDate),
                        },
                        endDate: {
                            gte: new Date(dateRange.startDate),
                        },
                    },
                ];
            }
            else {
                const currentYear = new Date().getFullYear();
                budgetWhere.fiscalYear = currentYear;
            }
            budgetWhere.status = 'ACTIVE';
            const budgets = await this.prisma.budget.findMany({
                where: budgetWhere,
                include: {
                    budgetItems: {
                        include: {
                            expenseCategory: true,
                        },
                    },
                },
            });
            if (budgets.length === 0) {
                return {
                    branchId,
                    organisationId,
                    startDate: dateRange?.startDate,
                    endDate: dateRange?.endDate,
                    categories: [],
                    totals: {
                        budgeted: 0,
                        actual: 0,
                        variance: 0,
                        percentVariance: 0,
                    },
                };
            }
            const categoryMap = new Map();
            for (const budget of budgets) {
                for (const item of budget.budgetItems) {
                    const categoryName = item.expenseCategory?.name || 'Uncategorized';
                    const existing = categoryMap.get(categoryName) || { name: categoryName, budgeted: 0, actual: 0 };
                    existing.budgeted += item.amount;
                    categoryMap.set(categoryName, existing);
                }
            }
            const expenseWhere = {};
            if (branchId) {
                expenseWhere.branchId = branchId;
            }
            if (organisationId) {
                expenseWhere.organisationId = organisationId;
            }
            if (dateRange?.startDate && dateRange?.endDate) {
                expenseWhere.date = {
                    gte: new Date(dateRange.startDate),
                    lte: new Date(dateRange.endDate),
                };
            }
            else {
                if (budgets.length > 0) {
                    expenseWhere.date = {
                        gte: budgets[0].startDate,
                        lte: budgets[0].endDate,
                    };
                }
            }
            const expenses = await this.prisma.expense.findMany({
                where: expenseWhere,
                include: {
                    expenseCategory: true,
                },
            });
            for (const expense of expenses) {
                const categoryName = expense.expenseCategory?.name || 'Uncategorized';
                const existing = categoryMap.get(categoryName) || { name: categoryName, budgeted: 0, actual: 0 };
                existing.actual += expense.amount;
                categoryMap.set(categoryName, existing);
            }
            const categories = Array.from(categoryMap.values()).map(({ name, budgeted, actual }) => {
                const variance = budgeted - actual;
                const percentVariance = budgeted > 0 ? (variance / budgeted) * 100 : 0;
                return {
                    name,
                    budgeted,
                    actual,
                    variance,
                    percentVariance: Number(percentVariance.toFixed(2)),
                };
            });
            const totals = categories.reduce((acc, category) => {
                acc.budgeted += category.budgeted;
                acc.actual += category.actual;
                acc.variance += category.variance;
                return acc;
            }, { budgeted: 0, actual: 0, variance: 0, percentVariance: 0 });
            totals.percentVariance = totals.budgeted > 0
                ? Number(((totals.variance / totals.budgeted) * 100).toFixed(2))
                : 0;
            return {
                branchId,
                organisationId,
                startDate: dateRange?.startDate || (budgets.length > 0 ? budgets[0].startDate : undefined),
                endDate: dateRange?.endDate || (budgets.length > 0 ? budgets[0].endDate : undefined),
                categories,
                totals,
            };
        }
        catch (error) {
            this.logger.error('Failed to get budget vs actual report', error.stack);
            throw new Error('Could not retrieve budget vs actual report.');
        }
    }
    async getPledgeFulfillmentReport(filter, fundId) {
        try {
            const { branchId, organisationId, dateRange } = filter;
            const pledgeWhere = {};
            if (branchId) {
                pledgeWhere.branchId = branchId;
            }
            if (organisationId) {
                pledgeWhere.organisationId = organisationId;
            }
            if (fundId) {
                pledgeWhere.fundId = fundId;
            }
            if (dateRange?.startDate && dateRange?.endDate) {
                pledgeWhere.OR = [
                    {
                        startDate: {
                            lte: new Date(dateRange.endDate),
                        },
                        endDate: {
                            gte: new Date(dateRange.startDate),
                        },
                    },
                    {
                        startDate: {
                            lte: new Date(dateRange.endDate),
                        },
                        endDate: null,
                    },
                ];
            }
            const pledges = await this.prisma.pledge.findMany({
                where: pledgeWhere,
                include: {
                    member: true,
                    fund: true,
                    contributions: true,
                },
            });
            let totalPledged = 0;
            let totalFulfilled = 0;
            let fullyFulfilledCount = 0;
            let partiallyFulfilledCount = 0;
            let unfulfilledCount = 0;
            const pledgeItems = pledges.map(pledge => {
                const fulfillmentPercentage = pledge.amount > 0
                    ? (pledge.amountFulfilled / pledge.amount) * 100
                    : 0;
                if (fulfillmentPercentage >= 100) {
                    fullyFulfilledCount++;
                }
                else if (fulfillmentPercentage > 0) {
                    partiallyFulfilledCount++;
                }
                else {
                    unfulfilledCount++;
                }
                totalPledged += pledge.amount;
                totalFulfilled += pledge.amountFulfilled;
                return {
                    id: pledge.id,
                    amount: pledge.amount,
                    amountFulfilled: pledge.amountFulfilled,
                    fulfillmentPercentage: Number(fulfillmentPercentage.toFixed(2)),
                    startDate: pledge.startDate,
                    endDate: pledge.endDate,
                    frequency: pledge.frequency,
                    status: pledge.status,
                    memberName: pledge.member?.firstName + ' ' + pledge.member?.lastName,
                    fundName: pledge.fund?.name,
                };
            });
            const fulfillmentRate = totalPledged > 0
                ? Number(((totalFulfilled / totalPledged) * 100).toFixed(2))
                : 0;
            return {
                branchId,
                organisationId,
                fundId,
                totalPledged,
                totalFulfilled,
                fulfillmentRate,
                pledgeCount: pledges.length,
                fullyFulfilledCount,
                partiallyFulfilledCount,
                unfulfilled: unfulfilledCount,
                pledges: pledgeItems,
            };
        }
        catch (error) {
            this.logger.error('Failed to get pledge fulfillment report', error.stack);
            throw new Error('Could not retrieve pledge fulfillment report.');
        }
    }
};
exports.FinancialReportsService = FinancialReportsService;
exports.FinancialReportsService = FinancialReportsService = FinancialReportsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FinancialReportsService);
//# sourceMappingURL=financial-reports.service.js.map