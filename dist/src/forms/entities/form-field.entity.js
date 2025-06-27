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
exports.FormField = exports.FormFieldTypeEnum = void 0;
const graphql_1 = require("@nestjs/graphql");
const graphql_type_json_1 = __importDefault(require("graphql-type-json"));
const graphql_2 = require("@nestjs/graphql");
const form_entity_1 = require("./form.entity");
const form_field_value_entity_1 = require("./form-field-value.entity");
const client_1 = require("@prisma/client");
var FormFieldTypeEnum;
(function (FormFieldTypeEnum) {
    FormFieldTypeEnum["TEXT"] = "TEXT";
    FormFieldTypeEnum["TEXTAREA"] = "TEXTAREA";
    FormFieldTypeEnum["NUMBER"] = "NUMBER";
    FormFieldTypeEnum["EMAIL"] = "EMAIL";
    FormFieldTypeEnum["PHONE"] = "PHONE";
    FormFieldTypeEnum["DATE"] = "DATE";
    FormFieldTypeEnum["TIME"] = "TIME";
    FormFieldTypeEnum["DATETIME"] = "DATETIME";
    FormFieldTypeEnum["SELECT"] = "SELECT";
    FormFieldTypeEnum["MULTISELECT"] = "MULTISELECT";
    FormFieldTypeEnum["CHECKBOX"] = "CHECKBOX";
    FormFieldTypeEnum["RADIO"] = "RADIO";
    FormFieldTypeEnum["FILE"] = "FILE";
    FormFieldTypeEnum["IMAGE"] = "IMAGE";
    FormFieldTypeEnum["SIGNATURE"] = "SIGNATURE";
    FormFieldTypeEnum["ADDRESS"] = "ADDRESS";
    FormFieldTypeEnum["NAME"] = "NAME";
    FormFieldTypeEnum["HIDDEN"] = "HIDDEN";
    FormFieldTypeEnum["HEADING"] = "HEADING";
    FormFieldTypeEnum["PARAGRAPH"] = "PARAGRAPH";
    FormFieldTypeEnum["DIVIDER"] = "DIVIDER";
    FormFieldTypeEnum["SPACER"] = "SPACER";
    FormFieldTypeEnum["CUSTOM"] = "CUSTOM";
})(FormFieldTypeEnum || (exports.FormFieldTypeEnum = FormFieldTypeEnum = {}));
(0, graphql_1.registerEnumType)(FormFieldTypeEnum, {
    name: 'FormFieldType',
    description: 'Type of form field',
});
let FormField = class FormField {
    id;
    formId;
    type;
    label;
    placeholder;
    helpText;
    defaultValue;
    options;
    isRequired;
    isUnique;
    validations;
    order;
    width;
    conditionalLogic;
    createdAt;
    updatedAt;
    form;
    fieldValues;
};
exports.FormField = FormField;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], FormField.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], FormField.prototype, "formId", void 0);
__decorate([
    (0, graphql_1.Field)(() => FormFieldTypeEnum),
    __metadata("design:type", String)
], FormField.prototype, "type", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], FormField.prototype, "label", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], FormField.prototype, "placeholder", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], FormField.prototype, "helpText", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], FormField.prototype, "defaultValue", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.default, { nullable: true }),
    __metadata("design:type", Object)
], FormField.prototype, "options", void 0);
__decorate([
    (0, graphql_1.Field)(() => Boolean),
    __metadata("design:type", Boolean)
], FormField.prototype, "isRequired", void 0);
__decorate([
    (0, graphql_1.Field)(() => Boolean),
    __metadata("design:type", Boolean)
], FormField.prototype, "isUnique", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.default, { nullable: true }),
    __metadata("design:type", Object)
], FormField.prototype, "validations", void 0);
__decorate([
    (0, graphql_1.Field)(() => Number),
    __metadata("design:type", Number)
], FormField.prototype, "order", void 0);
__decorate([
    (0, graphql_1.Field)(() => Number),
    __metadata("design:type", Number)
], FormField.prototype, "width", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.default, { nullable: true }),
    __metadata("design:type", Object)
], FormField.prototype, "conditionalLogic", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_2.GraphQLISODateTime),
    __metadata("design:type", Date)
], FormField.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_2.GraphQLISODateTime),
    __metadata("design:type", Date)
], FormField.prototype, "updatedAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => form_entity_1.Form, { nullable: true }),
    __metadata("design:type", form_entity_1.Form)
], FormField.prototype, "form", void 0);
__decorate([
    (0, graphql_1.Field)(() => [form_field_value_entity_1.FormFieldValue], { nullable: true }),
    __metadata("design:type", Array)
], FormField.prototype, "fieldValues", void 0);
exports.FormField = FormField = __decorate([
    (0, graphql_1.ObjectType)()
], FormField);
//# sourceMappingURL=form-field.entity.js.map