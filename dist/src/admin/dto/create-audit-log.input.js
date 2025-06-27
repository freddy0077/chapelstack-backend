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
exports.CreateAuditLogInput = void 0;
const graphql_1 = require("@nestjs/graphql");
const graphql_type_json_1 = require("graphql-type-json");
const class_validator_1 = require("class-validator");
let CreateAuditLogInput = class CreateAuditLogInput {
    action;
    entityType;
    entityId;
    description;
    metadata;
    ipAddress;
    userAgent;
    userId;
    branchId;
};
exports.CreateAuditLogInput = CreateAuditLogInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAuditLogInput.prototype, "action", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAuditLogInput.prototype, "entityType", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAuditLogInput.prototype, "entityId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAuditLogInput.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSON, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateAuditLogInput.prototype, "metadata", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAuditLogInput.prototype, "ipAddress", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAuditLogInput.prototype, "userAgent", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateAuditLogInput.prototype, "userId", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateAuditLogInput.prototype, "branchId", void 0);
exports.CreateAuditLogInput = CreateAuditLogInput = __decorate([
    (0, graphql_1.InputType)()
], CreateAuditLogInput);
//# sourceMappingURL=create-audit-log.input.js.map