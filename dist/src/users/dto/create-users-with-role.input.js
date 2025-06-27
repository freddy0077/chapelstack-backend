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
exports.CreateUsersWithRoleInput = void 0;
const graphql_1 = require("@nestjs/graphql");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
let UserInput = class UserInput {
    email;
    firstName;
    lastName;
    password;
    roleName;
    branchId;
};
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], UserInput.prototype, "email", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UserInput.prototype, "firstName", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UserInput.prototype, "lastName", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(8),
    __metadata("design:type", String)
], UserInput.prototype, "password", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UserInput.prototype, "roleName", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], UserInput.prototype, "branchId", void 0);
UserInput = __decorate([
    (0, graphql_1.InputType)()
], UserInput);
let CreateUsersWithRoleInput = class CreateUsersWithRoleInput {
    users;
    organisationId;
};
exports.CreateUsersWithRoleInput = CreateUsersWithRoleInput;
__decorate([
    (0, graphql_1.Field)(() => [UserInput]),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => UserInput),
    __metadata("design:type", Array)
], CreateUsersWithRoleInput.prototype, "users", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateUsersWithRoleInput.prototype, "organisationId", void 0);
exports.CreateUsersWithRoleInput = CreateUsersWithRoleInput = __decorate([
    (0, graphql_1.InputType)()
], CreateUsersWithRoleInput);
//# sourceMappingURL=create-users-with-role.input.js.map