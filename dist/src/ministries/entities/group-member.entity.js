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
exports.GroupMember = void 0;
const graphql_1 = require("@nestjs/graphql");
const ministry_entity_1 = require("./ministry.entity");
const small_group_entity_1 = require("./small-group.entity");
const member_entity_1 = require("../../members/entities/member.entity");
let GroupMember = class GroupMember {
    id;
    role;
    joinDate;
    status;
    memberId;
    ministryId;
    smallGroupId;
    createdAt;
    updatedAt;
    ministry;
    smallGroup;
    member;
};
exports.GroupMember = GroupMember;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], GroupMember.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], GroupMember.prototype, "role", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], GroupMember.prototype, "joinDate", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], GroupMember.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], GroupMember.prototype, "memberId", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], GroupMember.prototype, "ministryId", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], GroupMember.prototype, "smallGroupId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], GroupMember.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], GroupMember.prototype, "updatedAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => ministry_entity_1.Ministry, { nullable: true }),
    __metadata("design:type", Object)
], GroupMember.prototype, "ministry", void 0);
__decorate([
    (0, graphql_1.Field)(() => small_group_entity_1.SmallGroup, { nullable: true }),
    __metadata("design:type", Object)
], GroupMember.prototype, "smallGroup", void 0);
__decorate([
    (0, graphql_1.Field)(() => member_entity_1.Member, { nullable: true }),
    __metadata("design:type", Object)
], GroupMember.prototype, "member", void 0);
exports.GroupMember = GroupMember = __decorate([
    (0, graphql_1.ObjectType)()
], GroupMember);
//# sourceMappingURL=group-member.entity.js.map