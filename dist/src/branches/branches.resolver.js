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
exports.BranchesResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const branches_service_1 = require("./branches.service");
const branch_entity_1 = require("./entities/branch.entity");
const branch_setting_entity_1 = require("./entities/branch-setting.entity");
const create_branch_input_1 = require("./dto/create-branch.input");
const update_branch_input_1 = require("./dto/update-branch.input");
const update_branch_setting_input_1 = require("./dto/update-branch-setting.input");
const pagination_input_1 = require("../common/dto/pagination.input");
const branch_filter_input_1 = require("./dto/branch-filter.input");
const paginated_branches_output_1 = require("./dto/paginated-branches.output");
const members_service_1 = require("../members/services/members.service");
const member_entity_1 = require("../members/entities/member.entity");
const branch_statistics_output_1 = require("./dto/branch-statistics.output");
let BranchesResolver = class BranchesResolver {
    branchesService;
    membersService;
    constructor(branchesService, membersService) {
        this.branchesService = branchesService;
        this.membersService = membersService;
    }
    async createBranch(createBranchInput) {
        return this.branchesService.create(createBranchInput);
    }
    findAll(paginationInput, filterInput) {
        return this.branchesService.findAll(paginationInput || {}, filterInput);
    }
    findOne(id) {
        return this.branchesService.findOne(id);
    }
    updateBranch(id, updateBranchInput) {
        return this.branchesService.update(id, updateBranchInput);
    }
    removeBranch(id) {
        return this.branchesService.remove(id);
    }
    async getBranchSettings(branch) {
        return this.branchesService.findBranchSettings(branch.id);
    }
    async updateBranchSetting(branchId, updateSettingInput) {
        return this.branchesService.updateBranchSetting(branchId, updateSettingInput);
    }
    async getBranchStatistics(branch) {
        const { id: branchId } = branch;
        const getStatsForPeriod = async (periodBranchId, periodStartDate, periodEndDate) => {
            const totalMembersPromise = this.membersService.count({
                branchId: periodBranchId,
            });
            const activeMembersPromise = this.membersService.count({
                branchId: periodBranchId,
                status: member_entity_1.MemberStatus.ACTIVE,
            });
            const inactiveMembersPromise = this.membersService.count({
                branchId: periodBranchId,
                status: member_entity_1.MemberStatus.INACTIVE,
            });
            const newMembersInPeriodPromise = this.membersService.count({
                branchId: periodBranchId,
                membershipDate: {
                    gte: periodStartDate,
                    lte: periodEndDate,
                },
            });
            const [totalMembers, activeMembers, inactiveMembers, newMembersInPeriod] = await Promise.all([
                totalMembersPromise,
                activeMembersPromise,
                inactiveMembersPromise,
                newMembersInPeriodPromise,
            ]);
            return {
                totalMembers,
                activeMembers,
                inactiveMembers,
                newMembersInPeriod,
            };
        };
        const now = new Date();
        const currentMonthStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
        const currentMonthEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const prevMonthStartDate = new Date(prevMonthDate.getFullYear(), prevMonthDate.getMonth(), 1);
        const prevMonthEndDate = new Date(prevMonthDate.getFullYear(), prevMonthDate.getMonth() + 1, 0, 23, 59, 59, 999);
        const currentMonthStatsPromise = getStatsForPeriod(branchId, currentMonthStartDate, currentMonthEndDate);
        const lastMonthStatsPromise = getStatsForPeriod(branchId, prevMonthStartDate, prevMonthEndDate);
        const [currentMonthStats, lastMonthStats] = await Promise.all([
            currentMonthStatsPromise,
            lastMonthStatsPromise,
        ]);
        return {
            ...currentMonthStats,
            lastMonth: lastMonthStats,
        };
    }
};
exports.BranchesResolver = BranchesResolver;
__decorate([
    (0, graphql_1.Mutation)(() => branch_entity_1.Branch, { name: 'createBranch' }),
    __param(0, (0, graphql_1.Args)('createBranchInput')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_branch_input_1.CreateBranchInput]),
    __metadata("design:returntype", Promise)
], BranchesResolver.prototype, "createBranch", null);
__decorate([
    (0, graphql_1.Query)(() => paginated_branches_output_1.PaginatedBranches, { name: 'branches' }),
    __param(0, (0, graphql_1.Args)('paginationInput', { nullable: true })),
    __param(1, (0, graphql_1.Args)('filterInput', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_input_1.PaginationInput,
        branch_filter_input_1.BranchFilterInput]),
    __metadata("design:returntype", Promise)
], BranchesResolver.prototype, "findAll", null);
__decorate([
    (0, graphql_1.Query)(() => branch_entity_1.Branch, { name: 'branch', nullable: true }),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID }, common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BranchesResolver.prototype, "findOne", null);
__decorate([
    (0, graphql_1.Mutation)(() => branch_entity_1.Branch, { name: 'updateBranch' }),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID }, common_1.ParseUUIDPipe)),
    __param(1, (0, graphql_1.Args)('updateBranchInput')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_branch_input_1.UpdateBranchInput]),
    __metadata("design:returntype", Promise)
], BranchesResolver.prototype, "updateBranch", null);
__decorate([
    (0, graphql_1.Mutation)(() => branch_entity_1.Branch, { name: 'removeBranch' }),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID }, common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BranchesResolver.prototype, "removeBranch", null);
__decorate([
    (0, graphql_1.ResolveField)('settings', () => [branch_setting_entity_1.BranchSetting], { nullable: 'itemsAndList' }),
    __param(0, (0, graphql_1.Parent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [branch_entity_1.Branch]),
    __metadata("design:returntype", Promise)
], BranchesResolver.prototype, "getBranchSettings", null);
__decorate([
    (0, graphql_1.Mutation)(() => branch_setting_entity_1.BranchSetting, { name: 'updateBranchSetting' }),
    __param(0, (0, graphql_1.Args)('branchId', { type: () => graphql_1.ID }, common_1.ParseUUIDPipe)),
    __param(1, (0, graphql_1.Args)('updateSettingInput')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_branch_setting_input_1.UpdateBranchSettingInput]),
    __metadata("design:returntype", Promise)
], BranchesResolver.prototype, "updateBranchSetting", null);
__decorate([
    (0, graphql_1.ResolveField)('statistics', () => branch_statistics_output_1.BranchStatistics),
    __param(0, (0, graphql_1.Parent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [branch_entity_1.Branch]),
    __metadata("design:returntype", Promise)
], BranchesResolver.prototype, "getBranchStatistics", null);
exports.BranchesResolver = BranchesResolver = __decorate([
    (0, graphql_1.Resolver)(() => branch_entity_1.Branch),
    __metadata("design:paramtypes", [branches_service_1.BranchesService,
        members_service_1.MembersService])
], BranchesResolver);
//# sourceMappingURL=branches.resolver.js.map