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
exports.CreateFormSubmissionInput = void 0;
const graphql_1 = require("@nestjs/graphql");
const class_validator_1 = require("class-validator");
const create_form_field_value_input_1 = require("./create-form-field-value.input");
let CreateFormSubmissionInput = class CreateFormSubmissionInput {
    formId;
    ipAddress;
    userAgent;
    branchId;
    submittedById;
    fieldValues;
};
exports.CreateFormSubmissionInput = CreateFormSubmissionInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateFormSubmissionInput.prototype, "formId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateFormSubmissionInput.prototype, "ipAddress", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateFormSubmissionInput.prototype, "userAgent", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateFormSubmissionInput.prototype, "branchId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateFormSubmissionInput.prototype, "submittedById", void 0);
__decorate([
    (0, graphql_1.Field)(() => [create_form_field_value_input_1.CreateFormFieldValueInput]),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Array)
], CreateFormSubmissionInput.prototype, "fieldValues", void 0);
exports.CreateFormSubmissionInput = CreateFormSubmissionInput = __decorate([
    (0, graphql_1.InputType)()
], CreateFormSubmissionInput);
//# sourceMappingURL=create-form-submission.input.js.map