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
exports.Form = exports.FormStatusEnum = void 0;
const graphql_1 = require("@nestjs/graphql");
const form_field_entity_1 = require("./form-field.entity");
const form_submission_entity_1 = require("./form-submission.entity");
const graphql_2 = require("@nestjs/graphql");
const client_1 = require("@prisma/client");
var FormStatusEnum;
(function (FormStatusEnum) {
    FormStatusEnum["DRAFT"] = "DRAFT";
    FormStatusEnum["PUBLISHED"] = "PUBLISHED";
    FormStatusEnum["ARCHIVED"] = "ARCHIVED";
    FormStatusEnum["CLOSED"] = "CLOSED";
})(FormStatusEnum || (exports.FormStatusEnum = FormStatusEnum = {}));
(0, graphql_1.registerEnumType)(FormStatusEnum, {
    name: 'FormStatus',
    description: 'Status of a form',
});
let Form = class Form {
    id;
    title;
    description;
    status;
    isPublic;
    slug;
    successMessage;
    redirectUrl;
    enableCaptcha;
    notifyEmails;
    branchId;
    createdById;
    createdAt;
    updatedAt;
    expiresAt;
    submissionCount;
    fields;
    submissions;
};
exports.Form = Form;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], Form.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], Form.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], Form.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => FormStatusEnum),
    __metadata("design:type", String)
], Form.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)(() => Boolean),
    __metadata("design:type", Boolean)
], Form.prototype, "isPublic", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], Form.prototype, "slug", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], Form.prototype, "successMessage", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], Form.prototype, "redirectUrl", void 0);
__decorate([
    (0, graphql_1.Field)(() => Boolean),
    __metadata("design:type", Boolean)
], Form.prototype, "enableCaptcha", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String]),
    __metadata("design:type", Array)
], Form.prototype, "notifyEmails", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], Form.prototype, "branchId", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], Form.prototype, "createdById", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_2.GraphQLISODateTime),
    __metadata("design:type", Date)
], Form.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_2.GraphQLISODateTime),
    __metadata("design:type", Date)
], Form.prototype, "updatedAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_2.GraphQLISODateTime, { nullable: true }),
    __metadata("design:type", Object)
], Form.prototype, "expiresAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => Number),
    __metadata("design:type", Number)
], Form.prototype, "submissionCount", void 0);
__decorate([
    (0, graphql_1.Field)(() => [form_field_entity_1.FormField], { nullable: true }),
    __metadata("design:type", Array)
], Form.prototype, "fields", void 0);
__decorate([
    (0, graphql_1.Field)(() => [form_submission_entity_1.FormSubmission], { nullable: true }),
    __metadata("design:type", Array)
], Form.prototype, "submissions", void 0);
exports.Form = Form = __decorate([
    (0, graphql_1.ObjectType)()
], Form);
//# sourceMappingURL=form.entity.js.map