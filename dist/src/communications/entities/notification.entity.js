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
exports.Notification = void 0;
const graphql_1 = require("@nestjs/graphql");
const branch_entity_1 = require("../../branches/entities/branch.entity");
const member_entity_1 = require("../../members/entities/member.entity");
const organisation_model_1 = require("../../organisation/dto/organisation.model");
const user_entity_1 = require("../../users/entities/user.entity");
const notification_type_enum_1 = require("../enums/notification-type.enum");
let Notification = class Notification {
    id;
    user;
    userId;
    title;
    message;
    isRead;
    readAt;
    link;
    type;
    branch;
    branchId;
    member;
    memberId;
    organisation;
    organisationId;
    createdAt;
    updatedAt;
};
exports.Notification = Notification;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], Notification.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => user_entity_1.User),
    __metadata("design:type", user_entity_1.User)
], Notification.prototype, "user", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Notification.prototype, "userId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Notification.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Notification.prototype, "message", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], Notification.prototype, "isRead", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], Notification.prototype, "readAt", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], Notification.prototype, "link", void 0);
__decorate([
    (0, graphql_1.Field)(() => notification_type_enum_1.NotificationType),
    __metadata("design:type", String)
], Notification.prototype, "type", void 0);
__decorate([
    (0, graphql_1.Field)(() => branch_entity_1.Branch, { nullable: true }),
    __metadata("design:type", branch_entity_1.Branch)
], Notification.prototype, "branch", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], Notification.prototype, "branchId", void 0);
__decorate([
    (0, graphql_1.Field)(() => member_entity_1.Member, { nullable: true }),
    __metadata("design:type", member_entity_1.Member)
], Notification.prototype, "member", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], Notification.prototype, "memberId", void 0);
__decorate([
    (0, graphql_1.Field)(() => organisation_model_1.Organisation, { nullable: true }),
    __metadata("design:type", organisation_model_1.Organisation)
], Notification.prototype, "organisation", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], Notification.prototype, "organisationId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], Notification.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], Notification.prototype, "updatedAt", void 0);
exports.Notification = Notification = __decorate([
    (0, graphql_1.ObjectType)()
], Notification);
//# sourceMappingURL=notification.entity.js.map