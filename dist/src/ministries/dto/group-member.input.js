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
exports.GroupMemberFilterInput = exports.UpdateGroupMemberInput = exports.AddMemberToGroupInput = exports.GroupMemberStatus = exports.GroupMemberRole = void 0;
const graphql_1 = require("@nestjs/graphql");
const class_validator_1 = require("class-validator");
var GroupMemberRole;
(function (GroupMemberRole) {
    GroupMemberRole["LEADER"] = "LEADER";
    GroupMemberRole["CO_LEADER"] = "CO_LEADER";
    GroupMemberRole["MEMBER"] = "MEMBER";
})(GroupMemberRole || (exports.GroupMemberRole = GroupMemberRole = {}));
var GroupMemberStatus;
(function (GroupMemberStatus) {
    GroupMemberStatus["ACTIVE"] = "ACTIVE";
    GroupMemberStatus["INACTIVE"] = "INACTIVE";
})(GroupMemberStatus || (exports.GroupMemberStatus = GroupMemberStatus = {}));
let AddMemberToGroupInput = class AddMemberToGroupInput {
    memberId;
    ministryId;
    smallGroupId;
    role;
    status;
};
exports.AddMemberToGroupInput = AddMemberToGroupInput;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AddMemberToGroupInput.prototype, "memberId", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID, { nullable: true }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AddMemberToGroupInput.prototype, "ministryId", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID, { nullable: true }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AddMemberToGroupInput.prototype, "smallGroupId", void 0);
__decorate([
    (0, graphql_1.Field)({ defaultValue: GroupMemberRole.MEMBER }),
    (0, class_validator_1.IsEnum)(GroupMemberRole),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AddMemberToGroupInput.prototype, "role", void 0);
__decorate([
    (0, graphql_1.Field)({ defaultValue: GroupMemberStatus.ACTIVE }),
    (0, class_validator_1.IsEnum)(GroupMemberStatus),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AddMemberToGroupInput.prototype, "status", void 0);
exports.AddMemberToGroupInput = AddMemberToGroupInput = __decorate([
    (0, graphql_1.InputType)()
], AddMemberToGroupInput);
let UpdateGroupMemberInput = class UpdateGroupMemberInput {
    role;
    status;
};
exports.UpdateGroupMemberInput = UpdateGroupMemberInput;
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsEnum)(GroupMemberRole),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateGroupMemberInput.prototype, "role", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsEnum)(GroupMemberStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateGroupMemberInput.prototype, "status", void 0);
exports.UpdateGroupMemberInput = UpdateGroupMemberInput = __decorate([
    (0, graphql_1.InputType)()
], UpdateGroupMemberInput);
let GroupMemberFilterInput = class GroupMemberFilterInput {
    id;
    memberId;
    ministryId;
    smallGroupId;
    role;
    status;
};
exports.GroupMemberFilterInput = GroupMemberFilterInput;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID, { nullable: true }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], GroupMemberFilterInput.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID, { nullable: true }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], GroupMemberFilterInput.prototype, "memberId", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID, { nullable: true }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], GroupMemberFilterInput.prototype, "ministryId", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID, { nullable: true }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], GroupMemberFilterInput.prototype, "smallGroupId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsEnum)(GroupMemberRole),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], GroupMemberFilterInput.prototype, "role", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsEnum)(GroupMemberStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], GroupMemberFilterInput.prototype, "status", void 0);
exports.GroupMemberFilterInput = GroupMemberFilterInput = __decorate([
    (0, graphql_1.InputType)()
], GroupMemberFilterInput);
//# sourceMappingURL=group-member.input.js.map