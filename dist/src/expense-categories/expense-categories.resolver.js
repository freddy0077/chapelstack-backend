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
exports.ExpenseCategoriesResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const expense_categories_service_1 = require("./expense-categories.service");
const expense_category_entity_1 = require("./entities/expense-category.entity");
const create_expense_category_input_1 = require("./dto/create-expense-category.input");
const update_expense_category_input_1 = require("./dto/update-expense-category.input");
let ExpenseCategoriesResolver = class ExpenseCategoriesResolver {
    expenseCategoriesService;
    constructor(expenseCategoriesService) {
        this.expenseCategoriesService = expenseCategoriesService;
    }
    createExpenseCategory(createExpenseCategoryInput) {
        return this.expenseCategoriesService.create(createExpenseCategoryInput);
    }
    findAll(organisationId) {
        return this.expenseCategoriesService.findAll(organisationId);
    }
    findOne(id) {
        return this.expenseCategoriesService.findOne(id);
    }
    updateExpenseCategory(updateExpenseCategoryInput) {
        return this.expenseCategoriesService.update(updateExpenseCategoryInput.id, updateExpenseCategoryInput);
    }
    removeExpenseCategory(id) {
        return this.expenseCategoriesService.remove(id);
    }
};
exports.ExpenseCategoriesResolver = ExpenseCategoriesResolver;
__decorate([
    (0, graphql_1.Mutation)(() => expense_category_entity_1.ExpenseCategory),
    __param(0, (0, graphql_1.Args)('createExpenseCategoryInput')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_expense_category_input_1.CreateExpenseCategoryInput]),
    __metadata("design:returntype", void 0)
], ExpenseCategoriesResolver.prototype, "createExpenseCategory", null);
__decorate([
    (0, graphql_1.Query)(() => [expense_category_entity_1.ExpenseCategory], { name: 'expenseCategories' }),
    __param(0, (0, graphql_1.Args)('organisationId', { type: () => String, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ExpenseCategoriesResolver.prototype, "findAll", null);
__decorate([
    (0, graphql_1.Query)(() => expense_category_entity_1.ExpenseCategory, { name: 'expenseCategory' }),
    __param(0, (0, graphql_1.Args)('id', { type: () => String })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ExpenseCategoriesResolver.prototype, "findOne", null);
__decorate([
    (0, graphql_1.Mutation)(() => expense_category_entity_1.ExpenseCategory),
    __param(0, (0, graphql_1.Args)('updateExpenseCategoryInput')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_expense_category_input_1.UpdateExpenseCategoryInput]),
    __metadata("design:returntype", void 0)
], ExpenseCategoriesResolver.prototype, "updateExpenseCategory", null);
__decorate([
    (0, graphql_1.Mutation)(() => expense_category_entity_1.ExpenseCategory),
    __param(0, (0, graphql_1.Args)('id', { type: () => String })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ExpenseCategoriesResolver.prototype, "removeExpenseCategory", null);
exports.ExpenseCategoriesResolver = ExpenseCategoriesResolver = __decorate([
    (0, graphql_1.Resolver)(() => expense_category_entity_1.ExpenseCategory),
    __metadata("design:paramtypes", [expense_categories_service_1.ExpenseCategoriesService])
], ExpenseCategoriesResolver);
//# sourceMappingURL=expense-categories.resolver.js.map