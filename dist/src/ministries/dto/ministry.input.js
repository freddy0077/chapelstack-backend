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
exports.MinistryFilterInput = exports.UpdateMinistryInput = exports.CreateMinistryInput = exports.MinistryStatus = exports.MinistryType = void 0;
const graphql_1 = require("@nestjs/graphql");
const class_validator_1 = require("class-validator");
var MinistryType;
(function (MinistryType) {
    MinistryType["WORSHIP"] = "WORSHIP";
    MinistryType["OUTREACH"] = "OUTREACH";
    MinistryType["EDUCATION"] = "EDUCATION";
    MinistryType["PRAYER"] = "PRAYER";
    MinistryType["YOUTH"] = "YOUTH";
    MinistryType["CHILDREN"] = "CHILDREN";
    MinistryType["MISSIONS"] = "MISSIONS";
    MinistryType["ADMINISTRATION"] = "ADMINISTRATION";
    MinistryType["OTHER"] = "OTHER";
})(MinistryType || (exports.MinistryType = MinistryType = {}));
var MinistryStatus;
(function (MinistryStatus) {
    MinistryStatus["ACTIVE"] = "ACTIVE";
    MinistryStatus["INACTIVE"] = "INACTIVE";
})(MinistryStatus || (exports.MinistryStatus = MinistryStatus = {}));
let CreateMinistryInput = class CreateMinistryInput {
    name;
    description;
    type;
    status;
    branchId;
    parentId;
    organisationId;
};
exports.CreateMinistryInput = CreateMinistryInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateMinistryInput.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateMinistryInput.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsEnum)(MinistryType),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateMinistryInput.prototype, "type", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsEnum)(MinistryStatus),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateMinistryInput.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateMinistryInput.prototype, "branchId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateMinistryInput.prototype, "parentId", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID, { nullable: true }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateMinistryInput.prototype, "organisationId", void 0);
exports.CreateMinistryInput = CreateMinistryInput = __decorate([
    (0, graphql_1.InputType)()
], CreateMinistryInput);
let UpdateMinistryInput = class UpdateMinistryInput {
    name;
    description;
    type;
    status;
    branchId;
    parentId;
    organisationId;
};
exports.UpdateMinistryInput = UpdateMinistryInput;
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateMinistryInput.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateMinistryInput.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsEnum)(MinistryType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateMinistryInput.prototype, "type", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsEnum)(MinistryStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateMinistryInput.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateMinistryInput.prototype, "branchId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateMinistryInput.prototype, "parentId", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID, { nullable: true }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateMinistryInput.prototype, "organisationId", void 0);
exports.UpdateMinistryInput = UpdateMinistryInput = __decorate([
    (0, graphql_1.InputType)()
], UpdateMinistryInput);
let MinistryFilterInput = class MinistryFilterInput {
    id;
    name;
    type;
    status;
    branchId;
    parentId;
    organisationId;
};
exports.MinistryFilterInput = MinistryFilterInput;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID, { nullable: true }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], MinistryFilterInput.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], MinistryFilterInput.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsEnum)(MinistryType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], MinistryFilterInput.prototype, "type", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsEnum)(MinistryStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], MinistryFilterInput.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], MinistryFilterInput.prototype, "branchId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], MinistryFilterInput.prototype, "parentId", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID, { nullable: true }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], MinistryFilterInput.prototype, "organisationId", void 0);
exports.MinistryFilterInput = MinistryFilterInput = __decorate([
    (0, graphql_1.InputType)()
], MinistryFilterInput);
//# sourceMappingURL=ministry.input.js.map