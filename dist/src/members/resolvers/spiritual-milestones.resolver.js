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
exports.SpiritualMilestonesResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const spiritual_milestones_service_1 = require("../services/spiritual-milestones.service");
const spiritual_milestone_entity_1 = require("../entities/spiritual-milestone.entity");
const create_spiritual_milestone_input_1 = require("../dto/create-spiritual-milestone.input");
const update_spiritual_milestone_input_1 = require("../dto/update-spiritual-milestone.input");
const common_1 = require("@nestjs/common");
const current_user_decorator_1 = require("../../auth/decorators/current-user.decorator");
const decorators_1 = require("../../common/decorators");
let SpiritualMilestonesResolver = class SpiritualMilestonesResolver {
    spiritualMilestonesService;
    constructor(spiritualMilestonesService) {
        this.spiritualMilestonesService = spiritualMilestonesService;
    }
    async createSpiritualMilestone(createSpiritualMilestoneInput, userId, ipAddress, userAgent) {
        return this.spiritualMilestonesService.create(createSpiritualMilestoneInput, userId, ipAddress, userAgent);
    }
    async findAll(skip, take) {
        return this.spiritualMilestonesService.findAll(skip, take);
    }
    async findOne(id) {
        return this.spiritualMilestonesService.findOne(id);
    }
    async findByMember(memberId) {
        return this.spiritualMilestonesService.findByMember(memberId);
    }
    async updateSpiritualMilestone(id, updateSpiritualMilestoneInput, userId, ipAddress, userAgent) {
        return this.spiritualMilestonesService.update(id, updateSpiritualMilestoneInput, userId, ipAddress, userAgent);
    }
    async removeSpiritualMilestone(id, userId, ipAddress, userAgent) {
        return this.spiritualMilestonesService.remove(id, userId, ipAddress, userAgent);
    }
    async count() {
        return this.spiritualMilestonesService.count();
    }
};
exports.SpiritualMilestonesResolver = SpiritualMilestonesResolver;
__decorate([
    (0, graphql_1.Mutation)(() => spiritual_milestone_entity_1.SpiritualMilestone),
    __param(0, (0, graphql_1.Args)('createSpiritualMilestoneInput')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, decorators_1.IpAddress)()),
    __param(3, (0, decorators_1.UserAgent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_spiritual_milestone_input_1.CreateSpiritualMilestoneInput, String, String, String]),
    __metadata("design:returntype", Promise)
], SpiritualMilestonesResolver.prototype, "createSpiritualMilestone", null);
__decorate([
    (0, graphql_1.Query)(() => [spiritual_milestone_entity_1.SpiritualMilestone], { name: 'spiritualMilestones' }),
    __param(0, (0, graphql_1.Args)('skip', { type: () => graphql_1.Int, nullable: true, defaultValue: 0 })),
    __param(1, (0, graphql_1.Args)('take', { type: () => graphql_1.Int, nullable: true, defaultValue: 10 })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], SpiritualMilestonesResolver.prototype, "findAll", null);
__decorate([
    (0, graphql_1.Query)(() => spiritual_milestone_entity_1.SpiritualMilestone, { name: 'spiritualMilestone' }),
    __param(0, (0, graphql_1.Args)('id', { type: () => String }, common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SpiritualMilestonesResolver.prototype, "findOne", null);
__decorate([
    (0, graphql_1.Query)(() => [spiritual_milestone_entity_1.SpiritualMilestone], { name: 'spiritualMilestonesByMember' }),
    __param(0, (0, graphql_1.Args)('memberId', { type: () => String }, common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SpiritualMilestonesResolver.prototype, "findByMember", null);
__decorate([
    (0, graphql_1.Mutation)(() => spiritual_milestone_entity_1.SpiritualMilestone),
    __param(0, (0, graphql_1.Args)('id', { type: () => String }, common_1.ParseUUIDPipe)),
    __param(1, (0, graphql_1.Args)('updateSpiritualMilestoneInput')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __param(3, (0, decorators_1.IpAddress)()),
    __param(4, (0, decorators_1.UserAgent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_spiritual_milestone_input_1.UpdateSpiritualMilestoneInput, String, String, String]),
    __metadata("design:returntype", Promise)
], SpiritualMilestonesResolver.prototype, "updateSpiritualMilestone", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    __param(0, (0, graphql_1.Args)('id', { type: () => String }, common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, decorators_1.IpAddress)()),
    __param(3, (0, decorators_1.UserAgent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], SpiritualMilestonesResolver.prototype, "removeSpiritualMilestone", null);
__decorate([
    (0, graphql_1.Query)(() => graphql_1.Int, { name: 'spiritualMilestonesCount' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SpiritualMilestonesResolver.prototype, "count", null);
exports.SpiritualMilestonesResolver = SpiritualMilestonesResolver = __decorate([
    (0, graphql_1.Resolver)(() => spiritual_milestone_entity_1.SpiritualMilestone),
    __metadata("design:paramtypes", [spiritual_milestones_service_1.SpiritualMilestonesService])
], SpiritualMilestonesResolver);
//# sourceMappingURL=spiritual-milestones.resolver.js.map