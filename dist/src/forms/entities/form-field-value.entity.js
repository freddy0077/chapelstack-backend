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
exports.FormFieldValue = void 0;
const graphql_1 = require("@nestjs/graphql");
const graphql_2 = require("@nestjs/graphql");
const form_field_entity_1 = require("./form-field.entity");
let FormFieldValue = class FormFieldValue {
    id;
    submissionId;
    fieldId;
    value;
    fileUrl;
    createdAt;
    submission;
    field;
};
exports.FormFieldValue = FormFieldValue;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], FormFieldValue.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], FormFieldValue.prototype, "submissionId", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], FormFieldValue.prototype, "fieldId", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], FormFieldValue.prototype, "value", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], FormFieldValue.prototype, "fileUrl", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_2.GraphQLISODateTime),
    __metadata("design:type", Date)
], FormFieldValue.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { description: 'FormSubmission', nullable: true }),
    __metadata("design:type", Object)
], FormFieldValue.prototype, "submission", void 0);
__decorate([
    (0, graphql_1.Field)(() => form_field_entity_1.FormField, { nullable: true }),
    __metadata("design:type", Object)
], FormFieldValue.prototype, "field", void 0);
exports.FormFieldValue = FormFieldValue = __decorate([
    (0, graphql_1.ObjectType)()
], FormFieldValue);
//# sourceMappingURL=form-field-value.entity.js.map