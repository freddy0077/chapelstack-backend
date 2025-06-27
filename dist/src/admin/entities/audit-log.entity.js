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
exports.AuditLog = void 0;
const graphql_1 = require("@nestjs/graphql");
const user_entity_1 = require("../../auth/entities/user.entity");
const branch_entity_1 = require("../../branches/entities/branch.entity");
const graphql_type_json_1 = require("graphql-type-json");
let AuditLog = class AuditLog {
    id;
    action;
    entityType;
    entityId;
    description;
    metadata;
    ipAddress;
    userAgent;
    userId;
    user;
    branchId;
    branch;
    createdAt;
};
exports.AuditLog = AuditLog;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], AuditLog.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AuditLog.prototype, "action", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AuditLog.prototype, "entityType", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AuditLog.prototype, "entityId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AuditLog.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSON, { nullable: true }),
    __metadata("design:type", Object)
], AuditLog.prototype, "metadata", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AuditLog.prototype, "ipAddress", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AuditLog.prototype, "userAgent", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID, { nullable: true }),
    __metadata("design:type", String)
], AuditLog.prototype, "userId", void 0);
__decorate([
    (0, graphql_1.Field)(() => user_entity_1.User, { nullable: true }),
    __metadata("design:type", user_entity_1.User)
], AuditLog.prototype, "user", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID, { nullable: true }),
    __metadata("design:type", String)
], AuditLog.prototype, "branchId", void 0);
__decorate([
    (0, graphql_1.Field)(() => branch_entity_1.Branch, { nullable: true }),
    __metadata("design:type", branch_entity_1.Branch)
], AuditLog.prototype, "branch", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.GraphQLISODateTime),
    __metadata("design:type", Date)
], AuditLog.prototype, "createdAt", void 0);
exports.AuditLog = AuditLog = __decorate([
    (0, graphql_1.ObjectType)()
], AuditLog);
//# sourceMappingURL=audit-log.entity.js.map