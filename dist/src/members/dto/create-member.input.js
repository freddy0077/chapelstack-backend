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
exports.CreateMemberInput = void 0;
const graphql_1 = require("@nestjs/graphql");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const member_entity_1 = require("../entities/member.entity");
const graphql_type_json_1 = require("graphql-type-json");
const graphql_2 = require("@nestjs/graphql");
const enum_validation_util_1 = require("../../common/utils/enum-validation.util");
let CreateMemberInput = class CreateMemberInput {
    firstName;
    middleName;
    lastName;
    email;
    phoneNumber;
    address;
    city;
    state;
    postalCode;
    country;
    dateOfBirth;
    gender;
    maritalStatus;
    occupation;
    employerName;
    status = member_entity_1.MemberStatus.ACTIVE;
    membershipDate;
    baptismDate;
    confirmationDate;
    customFields;
    privacySettings;
    notes;
    branchId;
    userId;
    spouseId;
    parentId;
    organisationId;
};
exports.CreateMemberInput = CreateMemberInput;
__decorate([
    (0, graphql_1.Field)(() => String),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMemberInput.prototype, "firstName", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMemberInput.prototype, "middleName", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMemberInput.prototype, "lastName", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreateMemberInput.prototype, "email", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMemberInput.prototype, "phoneNumber", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMemberInput.prototype, "address", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMemberInput.prototype, "city", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMemberInput.prototype, "state", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMemberInput.prototype, "postalCode", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMemberInput.prototype, "country", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_2.GraphQLISODateTime, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], CreateMemberInput.prototype, "dateOfBirth", void 0);
__decorate([
    (0, graphql_1.Field)(() => member_entity_1.Gender, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, enum_validation_util_1.IsValidEnum)(member_entity_1.Gender),
    __metadata("design:type", String)
], CreateMemberInput.prototype, "gender", void 0);
__decorate([
    (0, graphql_1.Field)(() => member_entity_1.MaritalStatus, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, enum_validation_util_1.IsValidEnum)(member_entity_1.MaritalStatus),
    __metadata("design:type", String)
], CreateMemberInput.prototype, "maritalStatus", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMemberInput.prototype, "occupation", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMemberInput.prototype, "employerName", void 0);
__decorate([
    (0, graphql_1.Field)(() => member_entity_1.MemberStatus),
    (0, class_validator_1.IsNotEmpty)(),
    (0, enum_validation_util_1.IsValidEnum)(member_entity_1.MemberStatus),
    __metadata("design:type", String)
], CreateMemberInput.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_2.GraphQLISODateTime, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], CreateMemberInput.prototype, "membershipDate", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_2.GraphQLISODateTime, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Object)
], CreateMemberInput.prototype, "baptismDate", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_2.GraphQLISODateTime, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], CreateMemberInput.prototype, "confirmationDate", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSON, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateMemberInput.prototype, "customFields", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSON, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateMemberInput.prototype, "privacySettings", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMemberInput.prototype, "notes", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateMemberInput.prototype, "branchId", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateMemberInput.prototype, "userId", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateMemberInput.prototype, "spouseId", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateMemberInput.prototype, "parentId", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateMemberInput.prototype, "organisationId", void 0);
exports.CreateMemberInput = CreateMemberInput = __decorate([
    (0, graphql_1.InputType)()
], CreateMemberInput);
//# sourceMappingURL=create-member.input.js.map