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
exports.EmailMessage = void 0;
const graphql_1 = require("@nestjs/graphql");
const branch_entity_1 = require("../../branches/entities/branch.entity");
const organisation_model_1 = require("../../organisation/dto/organisation.model");
const email_template_entity_1 = require("./email-template.entity");
const message_status_enum_1 = require("../enums/message-status.enum");
let EmailMessage = class EmailMessage {
    id;
    subject;
    bodyHtml;
    bodyText;
    senderEmail;
    recipients;
    sentAt;
    status;
    branch;
    branchId;
    template;
    templateId;
    organisation;
    organisationId;
    createdAt;
    updatedAt;
};
exports.EmailMessage = EmailMessage;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], EmailMessage.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], EmailMessage.prototype, "subject", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], EmailMessage.prototype, "bodyHtml", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], EmailMessage.prototype, "bodyText", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], EmailMessage.prototype, "senderEmail", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String]),
    __metadata("design:type", Array)
], EmailMessage.prototype, "recipients", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], EmailMessage.prototype, "sentAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => message_status_enum_1.MessageStatus),
    __metadata("design:type", String)
], EmailMessage.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)(() => branch_entity_1.Branch, { nullable: true }),
    __metadata("design:type", branch_entity_1.Branch)
], EmailMessage.prototype, "branch", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], EmailMessage.prototype, "branchId", void 0);
__decorate([
    (0, graphql_1.Field)(() => email_template_entity_1.EmailTemplate, { nullable: true }),
    __metadata("design:type", email_template_entity_1.EmailTemplate)
], EmailMessage.prototype, "template", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], EmailMessage.prototype, "templateId", void 0);
__decorate([
    (0, graphql_1.Field)(() => organisation_model_1.Organisation, { nullable: true }),
    __metadata("design:type", organisation_model_1.Organisation)
], EmailMessage.prototype, "organisation", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], EmailMessage.prototype, "organisationId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], EmailMessage.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], EmailMessage.prototype, "updatedAt", void 0);
exports.EmailMessage = EmailMessage = __decorate([
    (0, graphql_1.ObjectType)(),
    (0, graphql_1.InputType)('EmailMessageInput')
], EmailMessage);
//# sourceMappingURL=email-message.entity.js.map