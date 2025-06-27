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
exports.EmailTemplate = void 0;
const graphql_1 = require("@nestjs/graphql");
const branch_entity_1 = require("../../branches/entities/branch.entity");
const organisation_model_1 = require("../../organisation/dto/organisation.model");
let EmailTemplate = class EmailTemplate {
    id;
    name;
    description;
    subject;
    bodyHtml;
    bodyText;
    isActive;
    createdAt;
    updatedAt;
    branch;
    branchId;
    organisation;
    organisationId;
};
exports.EmailTemplate = EmailTemplate;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], EmailTemplate.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], EmailTemplate.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], EmailTemplate.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], EmailTemplate.prototype, "subject", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], EmailTemplate.prototype, "bodyHtml", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], EmailTemplate.prototype, "bodyText", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], EmailTemplate.prototype, "isActive", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], EmailTemplate.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], EmailTemplate.prototype, "updatedAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => branch_entity_1.Branch, { nullable: true }),
    __metadata("design:type", branch_entity_1.Branch)
], EmailTemplate.prototype, "branch", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], EmailTemplate.prototype, "branchId", void 0);
__decorate([
    (0, graphql_1.Field)(() => organisation_model_1.Organisation, { nullable: true }),
    __metadata("design:type", organisation_model_1.Organisation)
], EmailTemplate.prototype, "organisation", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], EmailTemplate.prototype, "organisationId", void 0);
exports.EmailTemplate = EmailTemplate = __decorate([
    (0, graphql_1.ObjectType)(),
    (0, graphql_1.InputType)('EmailTemplateInput')
], EmailTemplate);
//# sourceMappingURL=email-template.entity.js.map