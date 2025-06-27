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
exports.UserBranch = void 0;
const graphql_1 = require("@nestjs/graphql");
const user_entity_1 = require("./user.entity");
const role_entity_1 = require("./role.entity");
const branch_entity_1 = require("../../branches/entities/branch.entity");
let UserBranch = class UserBranch {
    userId;
    branchId;
    roleId;
    user;
    branch;
    role;
    assignedAt;
    assignedBy;
};
exports.UserBranch = UserBranch;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], UserBranch.prototype, "userId", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], UserBranch.prototype, "branchId", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], UserBranch.prototype, "roleId", void 0);
__decorate([
    (0, graphql_1.Field)(() => user_entity_1.User),
    __metadata("design:type", user_entity_1.User)
], UserBranch.prototype, "user", void 0);
__decorate([
    (0, graphql_1.Field)(() => branch_entity_1.Branch, { nullable: true }),
    __metadata("design:type", branch_entity_1.Branch)
], UserBranch.prototype, "branch", void 0);
__decorate([
    (0, graphql_1.Field)(() => role_entity_1.Role),
    __metadata("design:type", role_entity_1.Role)
], UserBranch.prototype, "role", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.GraphQLISODateTime),
    __metadata("design:type", Date)
], UserBranch.prototype, "assignedAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID, { nullable: true }),
    __metadata("design:type", Object)
], UserBranch.prototype, "assignedBy", void 0);
exports.UserBranch = UserBranch = __decorate([
    (0, graphql_1.ObjectType)()
], UserBranch);
//# sourceMappingURL=user-branch.entity.js.map