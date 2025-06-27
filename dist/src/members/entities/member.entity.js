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
exports.Member = exports.MaritalStatus = exports.Gender = exports.MemberStatus = void 0;
const graphql_1 = require("@nestjs/graphql");
const graphql_2 = require("@nestjs/graphql");
const graphql_type_json_1 = require("graphql-type-json");
const family_entity_1 = require("./family.entity");
const branch_entity_1 = require("../../branches/entities/branch.entity");
var MemberStatus;
(function (MemberStatus) {
    MemberStatus["ACTIVE"] = "ACTIVE";
    MemberStatus["INACTIVE"] = "INACTIVE";
    MemberStatus["VISITOR"] = "VISITOR";
    MemberStatus["DECEASED"] = "DECEASED";
    MemberStatus["TRANSFERRED"] = "TRANSFERRED";
})(MemberStatus || (exports.MemberStatus = MemberStatus = {}));
var Gender;
(function (Gender) {
    Gender["MALE"] = "MALE";
    Gender["FEMALE"] = "FEMALE";
    Gender["OTHER"] = "OTHER";
    Gender["PREFER_NOT_TO_SAY"] = "PREFER_NOT_TO_SAY";
})(Gender || (exports.Gender = Gender = {}));
var MaritalStatus;
(function (MaritalStatus) {
    MaritalStatus["SINGLE"] = "SINGLE";
    MaritalStatus["MARRIED"] = "MARRIED";
    MaritalStatus["DIVORCED"] = "DIVORCED";
    MaritalStatus["WIDOWED"] = "WIDOWED";
    MaritalStatus["SEPARATED"] = "SEPARATED";
    MaritalStatus["OTHER"] = "OTHER";
})(MaritalStatus || (exports.MaritalStatus = MaritalStatus = {}));
(0, graphql_1.registerEnumType)(MemberStatus, {
    name: 'MemberStatus',
    description: 'Status of a church member',
});
(0, graphql_1.registerEnumType)(Gender, {
    name: 'Gender',
    description: 'Gender options',
});
(0, graphql_1.registerEnumType)(MaritalStatus, {
    name: 'MaritalStatus',
    description: 'Marital status options',
});
let Member = class Member {
    id;
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
    status;
    membershipDate;
    baptismDate;
    confirmationDate;
    statusChangeDate;
    statusChangeReason;
    profileImageUrl;
    customFields;
    privacySettings;
    notes;
    branchId;
    spouseId;
    children;
    parentId;
    rfidCardId;
    createdAt;
    updatedAt;
    groupMemberships;
    attendanceRecords;
    sacramentalRecords;
    guardianProfile;
    notifications;
    prayerRequests;
    contributions;
    familyRelationships;
    families;
    organisationId;
    branch;
    spouse;
    parent;
};
exports.Member = Member;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], Member.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], Member.prototype, "firstName", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], Member.prototype, "middleName", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], Member.prototype, "lastName", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], Member.prototype, "email", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], Member.prototype, "phoneNumber", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], Member.prototype, "address", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], Member.prototype, "city", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], Member.prototype, "state", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], Member.prototype, "postalCode", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], Member.prototype, "country", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_2.GraphQLISODateTime, { nullable: true }),
    __metadata("design:type", Object)
], Member.prototype, "dateOfBirth", void 0);
__decorate([
    (0, graphql_1.Field)(() => Gender, { nullable: true }),
    __metadata("design:type", Object)
], Member.prototype, "gender", void 0);
__decorate([
    (0, graphql_1.Field)(() => MaritalStatus, { nullable: true }),
    __metadata("design:type", Object)
], Member.prototype, "maritalStatus", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], Member.prototype, "occupation", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], Member.prototype, "employerName", void 0);
__decorate([
    (0, graphql_1.Field)(() => MemberStatus),
    __metadata("design:type", String)
], Member.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_2.GraphQLISODateTime, { nullable: true }),
    __metadata("design:type", Object)
], Member.prototype, "membershipDate", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_2.GraphQLISODateTime, { nullable: true }),
    __metadata("design:type", Object)
], Member.prototype, "baptismDate", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_2.GraphQLISODateTime, { nullable: true }),
    __metadata("design:type", Object)
], Member.prototype, "confirmationDate", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_2.GraphQLISODateTime, { nullable: true }),
    __metadata("design:type", Object)
], Member.prototype, "statusChangeDate", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], Member.prototype, "statusChangeReason", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], Member.prototype, "profileImageUrl", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSON, { nullable: true }),
    __metadata("design:type", Object)
], Member.prototype, "customFields", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSON, { nullable: true }),
    __metadata("design:type", Object)
], Member.prototype, "privacySettings", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], Member.prototype, "notes", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], Member.prototype, "branchId", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], Member.prototype, "spouseId", void 0);
__decorate([
    (0, graphql_1.Field)(() => [Member], { nullable: true }),
    __metadata("design:type", Array)
], Member.prototype, "children", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], Member.prototype, "parentId", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], Member.prototype, "rfidCardId", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_2.GraphQLISODateTime),
    __metadata("design:type", Date)
], Member.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_2.GraphQLISODateTime),
    __metadata("design:type", Date)
], Member.prototype, "updatedAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => [graphql_type_json_1.GraphQLJSON], { nullable: true }),
    __metadata("design:type", Array)
], Member.prototype, "groupMemberships", void 0);
__decorate([
    (0, graphql_1.Field)(() => [graphql_type_json_1.GraphQLJSON], { nullable: true }),
    __metadata("design:type", Array)
], Member.prototype, "attendanceRecords", void 0);
__decorate([
    (0, graphql_1.Field)(() => [graphql_type_json_1.GraphQLJSON], { nullable: true }),
    __metadata("design:type", Array)
], Member.prototype, "sacramentalRecords", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSON, { nullable: true }),
    __metadata("design:type", Object)
], Member.prototype, "guardianProfile", void 0);
__decorate([
    (0, graphql_1.Field)(() => [graphql_type_json_1.GraphQLJSON], { nullable: true }),
    __metadata("design:type", Array)
], Member.prototype, "notifications", void 0);
__decorate([
    (0, graphql_1.Field)(() => [graphql_type_json_1.GraphQLJSON], { nullable: true }),
    __metadata("design:type", Array)
], Member.prototype, "prayerRequests", void 0);
__decorate([
    (0, graphql_1.Field)(() => [graphql_type_json_1.GraphQLJSON], { nullable: true }),
    __metadata("design:type", Array)
], Member.prototype, "contributions", void 0);
__decorate([
    (0, graphql_1.Field)(() => [family_entity_1.FamilyRelationship], { nullable: true }),
    __metadata("design:type", Array)
], Member.prototype, "familyRelationships", void 0);
__decorate([
    (0, graphql_1.Field)(() => [family_entity_1.Family], { nullable: true }),
    __metadata("design:type", Array)
], Member.prototype, "families", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], Member.prototype, "organisationId", void 0);
__decorate([
    (0, graphql_1.Field)(() => branch_entity_1.Branch, { nullable: true }),
    __metadata("design:type", Object)
], Member.prototype, "branch", void 0);
__decorate([
    (0, graphql_1.Field)(() => Member, { nullable: true }),
    __metadata("design:type", Object)
], Member.prototype, "spouse", void 0);
__decorate([
    (0, graphql_1.Field)(() => Member, { nullable: true }),
    __metadata("design:type", Object)
], Member.prototype, "parent", void 0);
exports.Member = Member = __decorate([
    (0, graphql_1.ObjectType)()
], Member);
//# sourceMappingURL=member.entity.js.map