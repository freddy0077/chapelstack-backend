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
exports.BudgetsResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const budgets_service_1 = require("./budgets.service");
const budget_entity_1 = require("./entities/budget.entity");
const create_budget_input_1 = require("./dto/create-budget.input");
const update_budget_input_1 = require("./dto/update-budget.input");
let BudgetsResolver = class BudgetsResolver {
    budgetsService;
    constructor(budgetsService) {
        this.budgetsService = budgetsService;
    }
    createBudget(createBudgetInput) {
        return this.budgetsService.create(createBudgetInput);
    }
    findAll(organisationId) {
        return this.budgetsService.findAll(organisationId);
    }
    findOne(id) {
        return this.budgetsService.findOne(id);
    }
    updateBudget(updateBudgetInput) {
        return this.budgetsService.update(updateBudgetInput.id, updateBudgetInput);
    }
    removeBudget(id) {
        return this.budgetsService.remove(id);
    }
};
exports.BudgetsResolver = BudgetsResolver;
__decorate([
    (0, graphql_1.Mutation)(() => budget_entity_1.Budget),
    __param(0, (0, graphql_1.Args)('createBudgetInput')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_budget_input_1.CreateBudgetInput]),
    __metadata("design:returntype", void 0)
], BudgetsResolver.prototype, "createBudget", null);
__decorate([
    (0, graphql_1.Query)(() => [budget_entity_1.Budget], { name: 'budgets' }),
    __param(0, (0, graphql_1.Args)('organisationId', { type: () => String, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BudgetsResolver.prototype, "findAll", null);
__decorate([
    (0, graphql_1.Query)(() => budget_entity_1.Budget, { name: 'budget' }),
    __param(0, (0, graphql_1.Args)('id', { type: () => String })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BudgetsResolver.prototype, "findOne", null);
__decorate([
    (0, graphql_1.Mutation)(() => budget_entity_1.Budget),
    __param(0, (0, graphql_1.Args)('updateBudgetInput')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_budget_input_1.UpdateBudgetInput]),
    __metadata("design:returntype", void 0)
], BudgetsResolver.prototype, "updateBudget", null);
__decorate([
    (0, graphql_1.Mutation)(() => budget_entity_1.Budget),
    __param(0, (0, graphql_1.Args)('id', { type: () => String })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BudgetsResolver.prototype, "removeBudget", null);
exports.BudgetsResolver = BudgetsResolver = __decorate([
    (0, graphql_1.Resolver)(() => budget_entity_1.Budget),
    __metadata("design:paramtypes", [budgets_service_1.BudgetsService])
], BudgetsResolver);
//# sourceMappingURL=budgets.resolver.js.map