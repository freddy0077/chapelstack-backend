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
exports.SmallGroupsResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const small_groups_service_1 = require("../services/small-groups.service");
const small_group_entity_1 = require("../entities/small-group.entity");
const small_group_input_1 = require("../dto/small-group.input");
const group_member_entity_1 = require("../entities/group-member.entity");
const group_members_service_1 = require("../services/group-members.service");
const ministry_entity_1 = require("../entities/ministry.entity");
const ministries_service_1 = require("../services/ministries.service");
let SmallGroupsResolver = class SmallGroupsResolver {
    smallGroupsService;
    groupMembersService;
    ministriesService;
    constructor(smallGroupsService, groupMembersService, ministriesService) {
        this.smallGroupsService = smallGroupsService;
        this.groupMembersService = groupMembersService;
        this.ministriesService = ministriesService;
    }
    async smallGroups(filters) {
        return this.smallGroupsService.findAll(filters);
    }
    async smallGroup(id) {
        return this.smallGroupsService.findOne(id);
    }
    async createSmallGroup(input) {
        return this.smallGroupsService.create(input);
    }
    async updateSmallGroup(id, input) {
        return this.smallGroupsService.update(id, input);
    }
    async deleteSmallGroup(id) {
        return this.smallGroupsService.remove(id);
    }
    async members(smallGroup) {
        return this.groupMembersService.getMembersBySmallGroup(smallGroup.id);
    }
    async ministry(smallGroup) {
        if (!smallGroup.ministryId)
            return null;
        return this.ministriesService.findOne(smallGroup.ministryId);
    }
};
exports.SmallGroupsResolver = SmallGroupsResolver;
__decorate([
    (0, graphql_1.Query)(() => [small_group_entity_1.SmallGroup]),
    __param(0, (0, graphql_1.Args)('filters', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [small_group_input_1.SmallGroupFilterInput]),
    __metadata("design:returntype", Promise)
], SmallGroupsResolver.prototype, "smallGroups", null);
__decorate([
    (0, graphql_1.Query)(() => small_group_entity_1.SmallGroup),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SmallGroupsResolver.prototype, "smallGroup", null);
__decorate([
    (0, graphql_1.Mutation)(() => small_group_entity_1.SmallGroup),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [small_group_input_1.CreateSmallGroupInput]),
    __metadata("design:returntype", Promise)
], SmallGroupsResolver.prototype, "createSmallGroup", null);
__decorate([
    (0, graphql_1.Mutation)(() => small_group_entity_1.SmallGroup),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, small_group_input_1.UpdateSmallGroupInput]),
    __metadata("design:returntype", Promise)
], SmallGroupsResolver.prototype, "updateSmallGroup", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SmallGroupsResolver.prototype, "deleteSmallGroup", null);
__decorate([
    (0, graphql_1.ResolveField)(() => [group_member_entity_1.GroupMember]),
    __param(0, (0, graphql_1.Parent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [small_group_entity_1.SmallGroup]),
    __metadata("design:returntype", Promise)
], SmallGroupsResolver.prototype, "members", null);
__decorate([
    (0, graphql_1.ResolveField)(() => ministry_entity_1.Ministry, { nullable: true }),
    __param(0, (0, graphql_1.Parent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [small_group_entity_1.SmallGroup]),
    __metadata("design:returntype", Promise)
], SmallGroupsResolver.prototype, "ministry", null);
exports.SmallGroupsResolver = SmallGroupsResolver = __decorate([
    (0, graphql_1.Resolver)(() => small_group_entity_1.SmallGroup),
    __metadata("design:paramtypes", [small_groups_service_1.SmallGroupsService,
        group_members_service_1.GroupMembersService,
        ministries_service_1.MinistriesService])
], SmallGroupsResolver);
//# sourceMappingURL=small-groups.resolver.js.map