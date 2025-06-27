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
exports.MinistriesResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const ministries_service_1 = require("../services/ministries.service");
const ministry_entity_1 = require("../entities/ministry.entity");
const ministry_input_1 = require("../dto/ministry.input");
const small_group_entity_1 = require("../entities/small-group.entity");
const small_groups_service_1 = require("../services/small-groups.service");
const group_member_entity_1 = require("../entities/group-member.entity");
const group_members_service_1 = require("../services/group-members.service");
let MinistriesResolver = class MinistriesResolver {
    ministriesService;
    smallGroupsService;
    groupMembersService;
    constructor(ministriesService, smallGroupsService, groupMembersService) {
        this.ministriesService = ministriesService;
        this.smallGroupsService = smallGroupsService;
        this.groupMembersService = groupMembersService;
    }
    async ministries(filters) {
        return this.ministriesService.findAll(filters);
    }
    async ministry(id) {
        return this.ministriesService.findOne(id);
    }
    async createMinistry(input) {
        return this.ministriesService.create(input);
    }
    async updateMinistry(id, input) {
        return this.ministriesService.update(id, input);
    }
    async deleteMinistry(id) {
        return this.ministriesService.remove(id);
    }
    async smallGroups(ministry) {
        return this.smallGroupsService.getGroupsByMinistry(ministry.id);
    }
    async members(ministry) {
        return this.groupMembersService.getMembersByMinistry(ministry.id);
    }
    async subMinistries(ministry) {
        return this.ministriesService.getSubMinistries(ministry.id);
    }
    async parent(ministry) {
        if (!ministry.parentId)
            return null;
        return this.ministriesService.getParentMinistry(ministry.id);
    }
};
exports.MinistriesResolver = MinistriesResolver;
__decorate([
    (0, graphql_1.Query)(() => [ministry_entity_1.Ministry]),
    __param(0, (0, graphql_1.Args)('filters', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ministry_input_1.MinistryFilterInput]),
    __metadata("design:returntype", Promise)
], MinistriesResolver.prototype, "ministries", null);
__decorate([
    (0, graphql_1.Query)(() => ministry_entity_1.Ministry),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MinistriesResolver.prototype, "ministry", null);
__decorate([
    (0, graphql_1.Mutation)(() => ministry_entity_1.Ministry),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ministry_input_1.CreateMinistryInput]),
    __metadata("design:returntype", Promise)
], MinistriesResolver.prototype, "createMinistry", null);
__decorate([
    (0, graphql_1.Mutation)(() => ministry_entity_1.Ministry),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, ministry_input_1.UpdateMinistryInput]),
    __metadata("design:returntype", Promise)
], MinistriesResolver.prototype, "updateMinistry", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MinistriesResolver.prototype, "deleteMinistry", null);
__decorate([
    (0, graphql_1.ResolveField)(() => [small_group_entity_1.SmallGroup]),
    __param(0, (0, graphql_1.Parent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ministry_entity_1.Ministry]),
    __metadata("design:returntype", Promise)
], MinistriesResolver.prototype, "smallGroups", null);
__decorate([
    (0, graphql_1.ResolveField)(() => [group_member_entity_1.GroupMember]),
    __param(0, (0, graphql_1.Parent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ministry_entity_1.Ministry]),
    __metadata("design:returntype", Promise)
], MinistriesResolver.prototype, "members", null);
__decorate([
    (0, graphql_1.ResolveField)(() => [ministry_entity_1.Ministry]),
    __param(0, (0, graphql_1.Parent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ministry_entity_1.Ministry]),
    __metadata("design:returntype", Promise)
], MinistriesResolver.prototype, "subMinistries", null);
__decorate([
    (0, graphql_1.ResolveField)(() => ministry_entity_1.Ministry, { nullable: true }),
    __param(0, (0, graphql_1.Parent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ministry_entity_1.Ministry]),
    __metadata("design:returntype", Promise)
], MinistriesResolver.prototype, "parent", null);
exports.MinistriesResolver = MinistriesResolver = __decorate([
    (0, graphql_1.Resolver)(() => ministry_entity_1.Ministry),
    __metadata("design:paramtypes", [ministries_service_1.MinistriesService,
        small_groups_service_1.SmallGroupsService,
        group_members_service_1.GroupMembersService])
], MinistriesResolver);
//# sourceMappingURL=ministries.resolver.js.map