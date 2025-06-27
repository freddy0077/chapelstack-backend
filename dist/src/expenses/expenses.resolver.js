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
exports.ExpensesResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const expenses_service_1 = require("./expenses.service");
const expense_entity_1 = require("./entities/expense.entity");
const create_expense_input_1 = require("./dto/create-expense.input");
const update_expense_input_1 = require("./dto/update-expense.input");
let ExpensesResolver = class ExpensesResolver {
    expensesService;
    constructor(expensesService) {
        this.expensesService = expensesService;
    }
    createExpense(createExpenseInput) {
        return this.expensesService.create(createExpenseInput);
    }
    findAll(organisationId) {
        return this.expensesService.findAll(organisationId);
    }
    findOne(id) {
        return this.expensesService.findOne(id);
    }
    updateExpense(updateExpenseInput) {
        return this.expensesService.update(updateExpenseInput.id, updateExpenseInput);
    }
    removeExpense(id) {
        return this.expensesService.remove(id);
    }
};
exports.ExpensesResolver = ExpensesResolver;
__decorate([
    (0, graphql_1.Mutation)(() => expense_entity_1.Expense),
    __param(0, (0, graphql_1.Args)('createExpenseInput')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_expense_input_1.CreateExpenseInput]),
    __metadata("design:returntype", void 0)
], ExpensesResolver.prototype, "createExpense", null);
__decorate([
    (0, graphql_1.Query)(() => [expense_entity_1.Expense], { name: 'expenses' }),
    __param(0, (0, graphql_1.Args)('organisationId', { type: () => String, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ExpensesResolver.prototype, "findAll", null);
__decorate([
    (0, graphql_1.Query)(() => expense_entity_1.Expense, { name: 'expense' }),
    __param(0, (0, graphql_1.Args)('id', { type: () => String })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ExpensesResolver.prototype, "findOne", null);
__decorate([
    (0, graphql_1.Mutation)(() => expense_entity_1.Expense),
    __param(0, (0, graphql_1.Args)('updateExpenseInput')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_expense_input_1.UpdateExpenseInput]),
    __metadata("design:returntype", void 0)
], ExpensesResolver.prototype, "updateExpense", null);
__decorate([
    (0, graphql_1.Mutation)(() => expense_entity_1.Expense),
    __param(0, (0, graphql_1.Args)('id', { type: () => String })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ExpensesResolver.prototype, "removeExpense", null);
exports.ExpensesResolver = ExpensesResolver = __decorate([
    (0, graphql_1.Resolver)(() => expense_entity_1.Expense),
    __metadata("design:paramtypes", [expenses_service_1.ExpensesService])
], ExpensesResolver);
//# sourceMappingURL=expenses.resolver.js.map