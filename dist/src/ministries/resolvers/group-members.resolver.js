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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupMembersResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const group_members_service_1 = require("../services/group-members.service");
const group_member_entity_1 = require("../entities/group-member.entity");
const group_member_input_1 = require("../dto/group-member.input");
const ministry_entity_1 = require("../entities/ministry.entity");
const ministries_service_1 = require("../services/ministries.service");
const small_group_entity_1 = require("../entities/small-group.entity");
const small_groups_service_1 = require("../services/small-groups.service");
const group_member_role_enum_1 = require("../enums/group-member-role.enum");
let GroupMembersResolver = class GroupMembersResolver {
    groupMembersService;
    ministriesService;
    smallGroupsService;
    constructor(groupMembersService, ministriesService, smallGroupsService) {
        this.groupMembersService = groupMembersService;
        this.ministriesService = ministriesService;
        this.smallGroupsService = smallGroupsService;
    }
    async groupMembers(filters) {
        return this.groupMembersService.findAll(filters);
    }
    async groupMember(id) {
        return this.groupMembersService.findOne(id);
    }
    async addMemberToGroup(groupId, memberId, roleInGroup) {
        const input = {
            memberId,
            smallGroupId: groupId,
            role: roleInGroup || group_member_role_enum_1.GroupMemberRole.MEMBER,
            status: 'ACTIVE',
        };
        return this.groupMembersService.addMemberToGroup(input);
    }
    async updateGroupMember(id, input) {
        return this.groupMembersService.updateGroupMember(id, input);
    }
    async removeMemberFromGroup(groupId, memberId) {
        const groupMember = await this.groupMembersService.findOne({
            smallGroupId: groupId,
            memberId,
        });
        if (!groupMember) {
            return false;
        }
        return this.groupMembersService.removeMemberFromGroup(groupMember.id);
    }
    async assignGroupLeader(groupId, memberId) {
        const groupMember = await this.groupMembersService.findOne({
            smallGroupId: groupId,
            memberId,
        });
        if (!groupMember) {
            throw new Error(`Group member not found for groupId ${groupId} and memberId ${memberId}`);
        }
        return this.groupMembersService.assignGroupLeader(groupMember.id);
    }
    async ministry(groupMember) {
        if (!groupMember.ministryId)
            return null;
        return this.ministriesService.findOne(groupMember.ministryId);
    }
    async smallGroup(groupMember) {
        if (!groupMember.smallGroupId)
            return null;
        return this.smallGroupsService.findOne(groupMember.smallGroupId);
    }
};
exports.GroupMembersResolver = GroupMembersResolver;
__decorate([
    (0, graphql_1.Query)(() => [group_member_entity_1.GroupMember]),
    __param(0, (0, graphql_1.Args)('filters', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [group_member_input_1.GroupMemberFilterInput]),
    __metadata("design:returntype", Promise)
], GroupMembersResolver.prototype, "groupMembers", null);
__decorate([
    (0, graphql_1.Query)(() => group_member_entity_1.GroupMember),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GroupMembersResolver.prototype, "groupMember", null);
__decorate([
    (0, graphql_1.Mutation)(() => group_member_entity_1.GroupMember),
    __param(0, (0, graphql_1.Args)('groupId', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('memberId', { type: () => graphql_1.ID })),
    __param(2, (0, graphql_1.Args)('roleInGroup', { type: () => String, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], GroupMembersResolver.prototype, "addMemberToGroup", null);
__decorate([
    (0, graphql_1.Mutation)(() => group_member_entity_1.GroupMember),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, group_member_input_1.UpdateGroupMemberInput]),
    __metadata("design:returntype", Promise)
], GroupMembersResolver.prototype, "updateGroupMember", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    __param(0, (0, graphql_1.Args)('groupId', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('memberId', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], GroupMembersResolver.prototype, "removeMemberFromGroup", null);
__decorate([
    (0, graphql_1.Mutation)(() => group_member_entity_1.GroupMember),
    __param(0, (0, graphql_1.Args)('groupId', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('memberId', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], GroupMembersResolver.prototype, "assignGroupLeader", null);
__decorate([
    (0, graphql_1.ResolveField)(() => ministry_entity_1.Ministry, { nullable: true }),
    __param(0, (0, graphql_1.Parent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [group_member_entity_1.GroupMember]),
    __metadata("design:returntype", Promise)
], GroupMembersResolver.prototype, "ministry", null);
__decorate([
    (0, graphql_1.ResolveField)(() => small_group_entity_1.SmallGroup, { nullable: true }),
    __param(0, (0, graphql_1.Parent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [group_member_entity_1.GroupMember]),
    __metadata("design:returntype", Promise)
], GroupMembersResolver.prototype, "smallGroup", null);
exports.GroupMembersResolver = GroupMembersResolver = __decorate([
    (0, graphql_1.Resolver)(() => group_member_entity_1.GroupMember),
    __metadata("design:paramtypes", [group_members_service_1.GroupMembersService,
        ministries_service_1.MinistriesService,
        small_groups_service_1.SmallGroupsService])
], GroupMembersResolver);
//# sourceMappingURL=group-members.resolver.js.map