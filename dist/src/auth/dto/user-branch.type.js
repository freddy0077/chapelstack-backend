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
exports.UserBranchType = void 0;
const graphql_1 = require("@nestjs/graphql");
const branch_type_1 = require("./branch.type");
const role_type_1 = require("./role.type");
let UserBranchType = class UserBranchType {
    userId;
    branchId;
    roleId;
    assignedAt;
    assignedBy;
    branch;
    role;
};
exports.UserBranchType = UserBranchType;
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], UserBranchType.prototype, "userId", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], UserBranchType.prototype, "branchId", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], UserBranchType.prototype, "roleId", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date),
    __metadata("design:type", Date)
], UserBranchType.prototype, "assignedAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], UserBranchType.prototype, "assignedBy", void 0);
__decorate([
    (0, graphql_1.Field)(() => branch_type_1.BranchType, { nullable: true }),
    __metadata("design:type", branch_type_1.BranchType)
], UserBranchType.prototype, "branch", void 0);
__decorate([
    (0, graphql_1.Field)(() => role_type_1.RoleType),
    __metadata("design:type", role_type_1.RoleType)
], UserBranchType.prototype, "role", void 0);
exports.UserBranchType = UserBranchType = __decorate([
    (0, graphql_1.ObjectType)('UserBranchProfile')
], UserBranchType);
//# sourceMappingURL=user-branch.type.js.map