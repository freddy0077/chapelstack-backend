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
exports.MembersResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const members_service_1 = require("../services/members.service");
const member_entity_1 = require("../entities/member.entity");
const create_member_input_1 = require("../dto/create-member.input");
const update_member_input_1 = require("../dto/update-member.input");
const common_1 = require("@nestjs/common");
const current_user_decorator_1 = require("../../auth/decorators/current-user.decorator");
const decorators_1 = require("../../common/decorators");
const member_entity_2 = require("../entities/member.entity");
const assign_rfid_card_input_1 = require("../dto/assign-rfid-card.input");
const member_statistics_output_1 = require("../dto/member-statistics.output");
const member_dashboard_dto_1 = require("../dto/member-dashboard.dto");
let MembersResolver = class MembersResolver {
    membersService;
    constructor(membersService) {
        this.membersService = membersService;
    }
    async createMember(createMemberInput, userId, ipAddress, userAgent) {
        return this.membersService.create(createMemberInput, userId, ipAddress, userAgent);
    }
    async findAll(organisationId, skip, take, branchId, hasRfidCard, search) {
        const where = {};
        if (branchId) {
            where.branchId = branchId;
        }
        else if (organisationId) {
            where.organisationId = organisationId;
        }
        if (hasRfidCard === true) {
            where.rfidCardId = { not: null };
        }
        else if (hasRfidCard === false) {
            where.rfidCardId = { equals: null };
        }
        return this.membersService.findAll(skip ?? 0, take ?? 10, where, undefined, search);
    }
    async findOne(id) {
        return this.membersService.findOne(id);
    }
    async updateMember(id, updateMemberInput, userId, ipAddress, userAgent) {
        return this.membersService.update(id, updateMemberInput, userId, ipAddress, userAgent);
    }
    async removeMember(id, userId, ipAddress, userAgent) {
        return this.membersService.remove(id, userId, ipAddress, userAgent);
    }
    async transferMember(id, fromBranchId, toBranchId, reason, userId, ipAddress, userAgent) {
        return this.membersService.transferMember(id, fromBranchId, toBranchId, reason, userId, ipAddress, userAgent);
    }
    async addMemberToBranch(memberId, branchId, userId, ipAddress, userAgent) {
        return this.membersService.addMemberToBranch(memberId, branchId, userId, ipAddress, userAgent);
    }
    async removeMemberFromBranch(memberId, branchId, userId, ipAddress, userAgent) {
        return this.membersService.removeMemberFromBranch(memberId, branchId, userId, ipAddress, userAgent);
    }
    async updateMemberStatus(id, status, reason, userId, ipAddress, userAgent) {
        return this.membersService.updateMemberStatus(id, status, reason, userId, ipAddress, userAgent);
    }
    async count(branchId, organisationId) {
        const where = {};
        if (branchId) {
            where.branchId = branchId;
        }
        if (organisationId) {
            where.organisationId = organisationId;
        }
        return this.membersService.count(where);
    }
    async getMemberStatistics(branchId, organisationId) {
        return this.membersService.getStatistics(branchId, organisationId);
    }
    async assignRfidCardToMember(assignRfidCardInput, userId, ipAddress, userAgent) {
        return this.membersService.assignRfidCard(assignRfidCardInput, userId, ipAddress, userAgent);
    }
    async removeRfidCardFromMember(memberId, userId, ipAddress, userAgent) {
        return this.membersService.removeRfidCard(memberId, userId, ipAddress, userAgent);
    }
    async memberByRfidCard(rfidCardId) {
        return this.membersService.findMemberByRfidCard(rfidCardId);
    }
    async getMemberDashboard(memberId) {
        return this.membersService.getMemberDashboard(memberId);
    }
};
exports.MembersResolver = MembersResolver;
__decorate([
    (0, graphql_1.Mutation)(() => member_entity_1.Member),
    __param(0, (0, graphql_1.Args)('createMemberInput')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, decorators_1.IpAddress)()),
    __param(3, (0, decorators_1.UserAgent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_member_input_1.CreateMemberInput, String, String, String]),
    __metadata("design:returntype", Promise)
], MembersResolver.prototype, "createMember", null);
__decorate([
    (0, graphql_1.Query)(() => [member_entity_1.Member], { name: 'members' }),
    __param(0, (0, graphql_1.Args)('organisationId', { type: () => String, nullable: true })),
    __param(1, (0, graphql_1.Args)('skip', { type: () => graphql_1.Int, nullable: true, defaultValue: 0 })),
    __param(2, (0, graphql_1.Args)('take', { type: () => graphql_1.Int, nullable: true, defaultValue: 10 })),
    __param(3, (0, graphql_1.Args)('branchId', { type: () => String, nullable: true })),
    __param(4, (0, graphql_1.Args)('hasRfidCard', { type: () => Boolean, nullable: true })),
    __param(5, (0, graphql_1.Args)('search', { type: () => String, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number, String, Boolean, String]),
    __metadata("design:returntype", Promise)
], MembersResolver.prototype, "findAll", null);
__decorate([
    (0, graphql_1.Query)(() => member_entity_1.Member, { name: 'member' }),
    __param(0, (0, graphql_1.Args)('id', { type: () => String }, common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MembersResolver.prototype, "findOne", null);
__decorate([
    (0, graphql_1.Mutation)(() => member_entity_1.Member),
    __param(0, (0, graphql_1.Args)('id', { type: () => String }, common_1.ParseUUIDPipe)),
    __param(1, (0, graphql_1.Args)('updateMemberInput')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __param(3, (0, decorators_1.IpAddress)()),
    __param(4, (0, decorators_1.UserAgent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_member_input_1.UpdateMemberInput, String, String, String]),
    __metadata("design:returntype", Promise)
], MembersResolver.prototype, "updateMember", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    __param(0, (0, graphql_1.Args)('id', { type: () => String }, common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, decorators_1.IpAddress)()),
    __param(3, (0, decorators_1.UserAgent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], MembersResolver.prototype, "removeMember", null);
__decorate([
    (0, graphql_1.Mutation)(() => member_entity_1.Member),
    __param(0, (0, graphql_1.Args)('id', { type: () => String }, common_1.ParseUUIDPipe)),
    __param(1, (0, graphql_1.Args)('fromBranchId', { type: () => String }, common_1.ParseUUIDPipe)),
    __param(2, (0, graphql_1.Args)('toBranchId', { type: () => String }, common_1.ParseUUIDPipe)),
    __param(3, (0, graphql_1.Args)('reason', { type: () => String, nullable: true })),
    __param(4, (0, current_user_decorator_1.CurrentUser)()),
    __param(5, (0, decorators_1.IpAddress)()),
    __param(6, (0, decorators_1.UserAgent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], MembersResolver.prototype, "transferMember", null);
__decorate([
    (0, graphql_1.Mutation)(() => member_entity_1.Member),
    __param(0, (0, graphql_1.Args)('memberId', { type: () => String }, common_1.ParseUUIDPipe)),
    __param(1, (0, graphql_1.Args)('branchId', { type: () => String }, common_1.ParseUUIDPipe)),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __param(3, (0, decorators_1.IpAddress)()),
    __param(4, (0, decorators_1.UserAgent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], MembersResolver.prototype, "addMemberToBranch", null);
__decorate([
    (0, graphql_1.Mutation)(() => member_entity_1.Member),
    __param(0, (0, graphql_1.Args)('memberId', { type: () => String }, common_1.ParseUUIDPipe)),
    __param(1, (0, graphql_1.Args)('branchId', { type: () => String }, common_1.ParseUUIDPipe)),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __param(3, (0, decorators_1.IpAddress)()),
    __param(4, (0, decorators_1.UserAgent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], MembersResolver.prototype, "removeMemberFromBranch", null);
__decorate([
    (0, graphql_1.Mutation)(() => member_entity_1.Member),
    __param(0, (0, graphql_1.Args)('id', { type: () => String }, common_1.ParseUUIDPipe)),
    __param(1, (0, graphql_1.Args)('status', { type: () => member_entity_2.MemberStatus })),
    __param(2, (0, graphql_1.Args)('reason', { type: () => String, nullable: true })),
    __param(3, (0, current_user_decorator_1.CurrentUser)()),
    __param(4, (0, decorators_1.IpAddress)()),
    __param(5, (0, decorators_1.UserAgent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], MembersResolver.prototype, "updateMemberStatus", null);
__decorate([
    (0, graphql_1.Query)(() => graphql_1.Int, { name: 'membersCount' }),
    __param(0, (0, graphql_1.Args)('branchId', { type: () => String, nullable: true })),
    __param(1, (0, graphql_1.Args)('organisationId', { type: () => String, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MembersResolver.prototype, "count", null);
__decorate([
    (0, graphql_1.Query)(() => member_statistics_output_1.MemberStatistics, { name: 'memberStatistics' }),
    __param(0, (0, graphql_1.Args)('branchId', { type: () => String, nullable: true })),
    __param(1, (0, graphql_1.Args)('organisationId', { type: () => String, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MembersResolver.prototype, "getMemberStatistics", null);
__decorate([
    (0, graphql_1.Mutation)(() => member_entity_1.Member, { name: 'assignRfidCardToMember' }),
    __param(0, (0, graphql_1.Args)('assignRfidCardInput')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, decorators_1.IpAddress)()),
    __param(3, (0, decorators_1.UserAgent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [assign_rfid_card_input_1.AssignRfidCardInput, String, String, String]),
    __metadata("design:returntype", Promise)
], MembersResolver.prototype, "assignRfidCardToMember", null);
__decorate([
    (0, graphql_1.Mutation)(() => member_entity_1.Member, { name: 'removeRfidCardFromMember' }),
    __param(0, (0, graphql_1.Args)('memberId', { type: () => String }, common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, decorators_1.IpAddress)()),
    __param(3, (0, decorators_1.UserAgent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], MembersResolver.prototype, "removeRfidCardFromMember", null);
__decorate([
    (0, graphql_1.Query)(() => member_entity_1.Member, { name: 'memberByRfidCard', nullable: true }),
    __param(0, (0, graphql_1.Args)('rfidCardId', { type: () => String })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MembersResolver.prototype, "memberByRfidCard", null);
__decorate([
    (0, graphql_1.Query)(() => member_dashboard_dto_1.MemberDashboard, { name: 'memberDashboard' }),
    __param(0, (0, graphql_1.Args)('memberId', { type: () => String }, common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MembersResolver.prototype, "getMemberDashboard", null);
exports.MembersResolver = MembersResolver = __decorate([
    (0, graphql_1.Resolver)(() => member_entity_1.Member),
    __metadata("design:paramtypes", [members_service_1.MembersService])
], MembersResolver);
//# sourceMappingURL=members.resolver.js.map