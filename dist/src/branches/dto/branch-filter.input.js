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
exports.BranchFilterInput = void 0;
const graphql_1 = require("@nestjs/graphql");
const class_validator_1 = require("class-validator");
let BranchFilterInput = class BranchFilterInput {
    nameContains;
    cityContains;
    stateContains;
    countryContains;
    isActive;
    emailContains;
    id;
    organisationId;
};
exports.BranchFilterInput = BranchFilterInput;
__decorate([
    (0, graphql_1.Field)({
        nullable: true,
        description: 'Filter by name (case-insensitive, partial match)',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], BranchFilterInput.prototype, "nameContains", void 0);
__decorate([
    (0, graphql_1.Field)({
        nullable: true,
        description: 'Filter by city (case-insensitive, partial match)',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], BranchFilterInput.prototype, "cityContains", void 0);
__decorate([
    (0, graphql_1.Field)({
        nullable: true,
        description: 'Filter by state (case-insensitive, partial match)',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], BranchFilterInput.prototype, "stateContains", void 0);
__decorate([
    (0, graphql_1.Field)({
        nullable: true,
        description: 'Filter by country (case-insensitive, partial match)',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], BranchFilterInput.prototype, "countryContains", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true, description: 'Filter by active status' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], BranchFilterInput.prototype, "isActive", void 0);
__decorate([
    (0, graphql_1.Field)({
        nullable: true,
        description: 'Filter by email (case-insensitive, partial match)',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], BranchFilterInput.prototype, "emailContains", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true, description: 'Filter by branch ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BranchFilterInput.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true, description: 'Filter by organisation ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BranchFilterInput.prototype, "organisationId", void 0);
exports.BranchFilterInput = BranchFilterInput = __decorate([
    (0, graphql_1.InputType)()
], BranchFilterInput);
//# sourceMappingURL=branch-filter.input.js.map