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
exports.CreateBudgetInput = void 0;
const graphql_1 = require("@nestjs/graphql");
const class_validator_1 = require("class-validator");
let CreateBudgetInput = class CreateBudgetInput {
    name;
    description;
    fiscalYear;
    startDate;
    endDate;
    totalAmount;
    status;
    notes;
    fundId;
    ministryId;
    branchId;
    organisationId;
};
exports.CreateBudgetInput = CreateBudgetInput;
__decorate([
    (0, graphql_1.Field)(() => String),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBudgetInput.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBudgetInput.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateBudgetInput.prototype, "fiscalYear", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Date)
], CreateBudgetInput.prototype, "startDate", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Date)
], CreateBudgetInput.prototype, "endDate", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateBudgetInput.prototype, "totalAmount", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBudgetInput.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBudgetInput.prototype, "notes", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateBudgetInput.prototype, "fundId", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateBudgetInput.prototype, "ministryId", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateBudgetInput.prototype, "branchId", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateBudgetInput.prototype, "organisationId", void 0);
exports.CreateBudgetInput = CreateBudgetInput = __decorate([
    (0, graphql_1.InputType)()
], CreateBudgetInput);
//# sourceMappingURL=create-budget.input.js.map