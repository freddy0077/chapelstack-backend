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
exports.FormFilterInput = void 0;
const graphql_1 = require("@nestjs/graphql");
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
const form_entity_1 = require("../entities/form.entity");
const VALID_FORM_STATUSES = Object.values(form_entity_1.FormStatusEnum);
let FormFilterInput = class FormFilterInput {
    search;
    status;
    branchId;
};
exports.FormFilterInput = FormFilterInput;
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], FormFilterInput.prototype, "search", void 0);
__decorate([
    (0, graphql_1.Field)(() => form_entity_1.FormStatusEnum, { nullable: true }),
    (0, class_validator_1.IsIn)(VALID_FORM_STATUSES, {
        message: 'status must be a valid FormStatus enum value',
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], FormFilterInput.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], FormFilterInput.prototype, "branchId", void 0);
exports.FormFilterInput = FormFilterInput = __decorate([
    (0, graphql_1.InputType)()
], FormFilterInput);
//# sourceMappingURL=form-filter.input.js.map