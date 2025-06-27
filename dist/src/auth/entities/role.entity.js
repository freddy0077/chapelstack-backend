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
exports.Role = void 0;
const graphql_1 = require("@nestjs/graphql");
const permission_entity_1 = require("./permission.entity");
const user_entity_1 = require("./user.entity");
const user_branch_entity_1 = require("./user-branch.entity");
let Role = class Role {
    id;
    name;
    description;
    permissions;
    users;
    userBranches;
    createdAt;
    updatedAt;
};
exports.Role = Role;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], Role.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Role.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], Role.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => [permission_entity_1.Permission], { nullable: 'itemsAndList' }),
    __metadata("design:type", Array)
], Role.prototype, "permissions", void 0);
__decorate([
    (0, graphql_1.Field)(() => [user_entity_1.User], { nullable: 'itemsAndList' }),
    __metadata("design:type", Array)
], Role.prototype, "users", void 0);
__decorate([
    (0, graphql_1.Field)(() => [user_branch_entity_1.UserBranch], { nullable: 'itemsAndList' }),
    __metadata("design:type", Array)
], Role.prototype, "userBranches", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.GraphQLISODateTime),
    __metadata("design:type", Date)
], Role.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.GraphQLISODateTime),
    __metadata("design:type", Date)
], Role.prototype, "updatedAt", void 0);
exports.Role = Role = __decorate([
    (0, graphql_1.ObjectType)()
], Role);
//# sourceMappingURL=role.entity.js.map