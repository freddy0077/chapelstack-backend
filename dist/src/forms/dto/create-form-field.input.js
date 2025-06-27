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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateFormFieldInput = void 0;
const graphql_1 = require("@nestjs/graphql");
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
const form_field_entity_1 = require("../entities/form-field.entity");
const graphql_type_json_1 = __importDefault(require("graphql-type-json"));
const VALID_FORM_FIELD_TYPES = Object.values(form_field_entity_1.FormFieldTypeEnum);
let CreateFormFieldInput = class CreateFormFieldInput {
    formId;
    type;
    label;
    placeholder;
    helpText;
    defaultValue;
    options;
    isRequired = false;
    isUnique = false;
    validations;
    order;
    width = 100;
    conditionalLogic;
};
exports.CreateFormFieldInput = CreateFormFieldInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateFormFieldInput.prototype, "formId", void 0);
__decorate([
    (0, graphql_1.Field)(() => form_field_entity_1.FormFieldTypeEnum),
    (0, class_validator_1.IsIn)(VALID_FORM_FIELD_TYPES, {
        message: 'type must be a valid FormFieldType enum value',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateFormFieldInput.prototype, "type", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateFormFieldInput.prototype, "label", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateFormFieldInput.prototype, "placeholder", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateFormFieldInput.prototype, "helpText", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateFormFieldInput.prototype, "defaultValue", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.default, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateFormFieldInput.prototype, "options", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateFormFieldInput.prototype, "isRequired", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateFormFieldInput.prototype, "isUnique", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.default, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateFormFieldInput.prototype, "validations", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], CreateFormFieldInput.prototype, "order", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(10),
    (0, class_validator_1.Max)(100),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateFormFieldInput.prototype, "width", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.default, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateFormFieldInput.prototype, "conditionalLogic", void 0);
exports.CreateFormFieldInput = CreateFormFieldInput = __decorate([
    (0, graphql_1.InputType)()
], CreateFormFieldInput);
//# sourceMappingURL=create-form-field.input.js.map