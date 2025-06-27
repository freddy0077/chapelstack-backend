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
exports.CreateRoleWithPermissionsInput = exports.UpdatePermissionInput = exports.CreatePermissionInput = exports.UpdateRoleInput = exports.CreateRoleInput = void 0;
const graphql_1 = require("@nestjs/graphql");
const class_validator_1 = require("class-validator");
let CreateRoleInput = class CreateRoleInput {
    name;
    description;
};
exports.CreateRoleInput = CreateRoleInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRoleInput.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRoleInput.prototype, "description", void 0);
exports.CreateRoleInput = CreateRoleInput = __decorate([
    (0, graphql_1.InputType)()
], CreateRoleInput);
let UpdateRoleInput = class UpdateRoleInput {
    name;
    description;
};
exports.UpdateRoleInput = UpdateRoleInput;
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateRoleInput.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateRoleInput.prototype, "description", void 0);
exports.UpdateRoleInput = UpdateRoleInput = __decorate([
    (0, graphql_1.InputType)()
], UpdateRoleInput);
let CreatePermissionInput = class CreatePermissionInput {
    action;
    subject;
    description;
};
exports.CreatePermissionInput = CreatePermissionInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePermissionInput.prototype, "action", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePermissionInput.prototype, "subject", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePermissionInput.prototype, "description", void 0);
exports.CreatePermissionInput = CreatePermissionInput = __decorate([
    (0, graphql_1.InputType)()
], CreatePermissionInput);
let UpdatePermissionInput = class UpdatePermissionInput {
    action;
    subject;
    description;
};
exports.UpdatePermissionInput = UpdatePermissionInput;
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePermissionInput.prototype, "action", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePermissionInput.prototype, "subject", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePermissionInput.prototype, "description", void 0);
exports.UpdatePermissionInput = UpdatePermissionInput = __decorate([
    (0, graphql_1.InputType)()
], UpdatePermissionInput);
let CreateRoleWithPermissionsInput = class CreateRoleWithPermissionsInput {
    name;
    description;
    permissionIds;
};
exports.CreateRoleWithPermissionsInput = CreateRoleWithPermissionsInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRoleWithPermissionsInput.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRoleWithPermissionsInput.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => [graphql_1.ID]),
    (0, class_validator_1.IsNotEmpty)({ each: true }),
    (0, class_validator_1.IsUUID)('4', { each: true }),
    __metadata("design:type", Array)
], CreateRoleWithPermissionsInput.prototype, "permissionIds", void 0);
exports.CreateRoleWithPermissionsInput = CreateRoleWithPermissionsInput = __decorate([
    (0, graphql_1.InputType)()
], CreateRoleWithPermissionsInput);
//# sourceMappingURL=role-permission.input.js.map