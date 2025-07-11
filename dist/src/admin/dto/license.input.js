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
exports.LicenseFilterInput = exports.UpdateLicenseInput = exports.CreateLicenseInput = void 0;
const graphql_1 = require("@nestjs/graphql");
const class_validator_1 = require("class-validator");
const license_entity_1 = require("../entities/license.entity");
const graphql_type_json_1 = require("graphql-type-json");
const class_transformer_1 = require("class-transformer");
let CreateLicenseInput = class CreateLicenseInput {
    key;
    type;
    status;
    startDate;
    expiryDate;
    organizationName;
    contactEmail;
    contactPhone;
    features;
    maxUsers;
    maxBranches;
    notes;
};
exports.CreateLicenseInput = CreateLicenseInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLicenseInput.prototype, "key", void 0);
__decorate([
    (0, graphql_1.Field)(() => license_entity_1.LicenseType),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEnum)(license_entity_1.LicenseType),
    __metadata("design:type", String)
], CreateLicenseInput.prototype, "type", void 0);
__decorate([
    (0, graphql_1.Field)(() => license_entity_1.LicenseStatus),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEnum)(license_entity_1.LicenseStatus),
    __metadata("design:type", String)
], CreateLicenseInput.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], CreateLicenseInput.prototype, "startDate", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], CreateLicenseInput.prototype, "expiryDate", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLicenseInput.prototype, "organizationName", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreateLicenseInput.prototype, "contactEmail", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLicenseInput.prototype, "contactPhone", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSON, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateLicenseInput.prototype, "features", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateLicenseInput.prototype, "maxUsers", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateLicenseInput.prototype, "maxBranches", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLicenseInput.prototype, "notes", void 0);
exports.CreateLicenseInput = CreateLicenseInput = __decorate([
    (0, graphql_1.InputType)()
], CreateLicenseInput);
let UpdateLicenseInput = class UpdateLicenseInput {
    status;
    expiryDate;
    organizationName;
    contactEmail;
    contactPhone;
    features;
    maxUsers;
    maxBranches;
    notes;
};
exports.UpdateLicenseInput = UpdateLicenseInput;
__decorate([
    (0, graphql_1.Field)(() => license_entity_1.LicenseStatus, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(license_entity_1.LicenseStatus),
    __metadata("design:type", String)
], UpdateLicenseInput.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], UpdateLicenseInput.prototype, "expiryDate", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateLicenseInput.prototype, "organizationName", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], UpdateLicenseInput.prototype, "contactEmail", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateLicenseInput.prototype, "contactPhone", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSON, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateLicenseInput.prototype, "features", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateLicenseInput.prototype, "maxUsers", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateLicenseInput.prototype, "maxBranches", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateLicenseInput.prototype, "notes", void 0);
exports.UpdateLicenseInput = UpdateLicenseInput = __decorate([
    (0, graphql_1.InputType)()
], UpdateLicenseInput);
let LicenseFilterInput = class LicenseFilterInput {
    id;
    key;
    type;
    status;
    organizationName;
};
exports.LicenseFilterInput = LicenseFilterInput;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], LicenseFilterInput.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LicenseFilterInput.prototype, "key", void 0);
__decorate([
    (0, graphql_1.Field)(() => license_entity_1.LicenseType, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(license_entity_1.LicenseType),
    __metadata("design:type", String)
], LicenseFilterInput.prototype, "type", void 0);
__decorate([
    (0, graphql_1.Field)(() => license_entity_1.LicenseStatus, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(license_entity_1.LicenseStatus),
    __metadata("design:type", String)
], LicenseFilterInput.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LicenseFilterInput.prototype, "organizationName", void 0);
exports.LicenseFilterInput = LicenseFilterInput = __decorate([
    (0, graphql_1.InputType)()
], LicenseFilterInput);
//# sourceMappingURL=license.input.js.map