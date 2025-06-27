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
exports.AuthPayload = exports.UserType = exports.MemberType = void 0;
const graphql_1 = require("@nestjs/graphql");
const EmailScalar_1 = require("../../base/graphql/EmailScalar");
const role_type_1 = require("./role.type");
const user_branch_type_1 = require("./user-branch.type");
let MemberType = class MemberType {
    id;
    firstName;
    lastName;
    profileImageUrl;
    status;
};
exports.MemberType = MemberType;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], MemberType.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], MemberType.prototype, "firstName", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], MemberType.prototype, "lastName", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], MemberType.prototype, "profileImageUrl", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], MemberType.prototype, "status", void 0);
exports.MemberType = MemberType = __decorate([
    (0, graphql_1.ObjectType)('MemberProfile')
], MemberType);
let UserType = class UserType {
    id;
    email;
    firstName;
    lastName;
    phoneNumber;
    isActive;
    isEmailVerified;
    lastLoginAt;
    createdAt;
    updatedAt;
    roles;
    userBranches;
    organisationId;
    member;
};
exports.UserType = UserType;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], UserType.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => EmailScalar_1.EmailScalar),
    __metadata("design:type", String)
], UserType.prototype, "email", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], UserType.prototype, "firstName", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], UserType.prototype, "lastName", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], UserType.prototype, "phoneNumber", void 0);
__decorate([
    (0, graphql_1.Field)(() => Boolean),
    __metadata("design:type", Boolean)
], UserType.prototype, "isActive", void 0);
__decorate([
    (0, graphql_1.Field)(() => Boolean),
    __metadata("design:type", Boolean)
], UserType.prototype, "isEmailVerified", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date, { nullable: true }),
    __metadata("design:type", Date)
], UserType.prototype, "lastLoginAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date),
    __metadata("design:type", Date)
], UserType.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date),
    __metadata("design:type", Date)
], UserType.prototype, "updatedAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => [role_type_1.RoleType], { nullable: true }),
    __metadata("design:type", Array)
], UserType.prototype, "roles", void 0);
__decorate([
    (0, graphql_1.Field)(() => [user_branch_type_1.UserBranchType], { nullable: true }),
    __metadata("design:type", Array)
], UserType.prototype, "userBranches", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], UserType.prototype, "organisationId", void 0);
__decorate([
    (0, graphql_1.Field)(() => MemberType, { nullable: true }),
    __metadata("design:type", MemberType)
], UserType.prototype, "member", void 0);
exports.UserType = UserType = __decorate([
    (0, graphql_1.ObjectType)('UserProfile')
], UserType);
let AuthPayload = class AuthPayload {
    accessToken;
    refreshToken;
    user;
};
exports.AuthPayload = AuthPayload;
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], AuthPayload.prototype, "accessToken", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], AuthPayload.prototype, "refreshToken", void 0);
__decorate([
    (0, graphql_1.Field)(() => UserType),
    __metadata("design:type", UserType)
], AuthPayload.prototype, "user", void 0);
exports.AuthPayload = AuthPayload = __decorate([
    (0, graphql_1.ObjectType)('AuthPayload')
], AuthPayload);
//# sourceMappingURL=auth.types.js.map