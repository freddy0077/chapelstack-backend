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
exports.StatsResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const stats_service_1 = require("../services/stats.service");
const communication_stats_entity_1 = require("../entities/communication-stats.entity");
const message_performance_entity_1 = require("../entities/message-performance.entity");
const communication_stats_filter_input_1 = require("../dto/communication-stats-filter.input");
let StatsResolver = class StatsResolver {
    statsService;
    constructor(statsService) {
        this.statsService = statsService;
    }
    async communicationStats(filter) {
        return this.statsService.getCommunicationStats(filter?.branchId, filter?.startDate ? new Date(filter.startDate) : undefined, filter?.endDate ? new Date(filter.endDate) : undefined);
    }
    async communicationChannelStats(filter) {
        return this.statsService.getChannelStats(filter?.branchId, filter?.startDate ? new Date(filter.startDate) : undefined, filter?.endDate ? new Date(filter.endDate) : undefined, filter?.channels);
    }
    async recipientGroupStats(filter) {
        return this.statsService.getRecipientGroupStats(filter?.branchId, filter?.startDate ? new Date(filter.startDate) : undefined, filter?.endDate ? new Date(filter.endDate) : undefined);
    }
    async messagePerformanceMetrics(filter) {
        return this.statsService.getMessagePerformanceMetrics(filter?.branchId, filter?.startDate ? new Date(filter.startDate) : undefined, filter?.endDate ? new Date(filter.endDate) : undefined);
    }
};
exports.StatsResolver = StatsResolver;
__decorate([
    (0, graphql_1.Query)(() => communication_stats_entity_1.CommunicationStatsEntity),
    __param(0, (0, graphql_1.Args)('filter', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [communication_stats_filter_input_1.CommunicationStatsFilterInput]),
    __metadata("design:returntype", Promise)
], StatsResolver.prototype, "communicationStats", null);
__decorate([
    (0, graphql_1.Query)(() => [communication_stats_entity_1.CommunicationChannelStats]),
    __param(0, (0, graphql_1.Args)('filter', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [communication_stats_filter_input_1.CommunicationStatsFilterInput]),
    __metadata("design:returntype", Promise)
], StatsResolver.prototype, "communicationChannelStats", null);
__decorate([
    (0, graphql_1.Query)(() => [communication_stats_entity_1.RecipientGroupStats]),
    __param(0, (0, graphql_1.Args)('filter', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [communication_stats_filter_input_1.CommunicationStatsFilterInput]),
    __metadata("design:returntype", Promise)
], StatsResolver.prototype, "recipientGroupStats", null);
__decorate([
    (0, graphql_1.Query)(() => message_performance_entity_1.MessagePerformanceEntity),
    __param(0, (0, graphql_1.Args)('filter', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [communication_stats_filter_input_1.CommunicationStatsFilterInput]),
    __metadata("design:returntype", Promise)
], StatsResolver.prototype, "messagePerformanceMetrics", null);
exports.StatsResolver = StatsResolver = __decorate([
    (0, graphql_1.Resolver)(() => communication_stats_entity_1.CommunicationStatsEntity),
    __metadata("design:paramtypes", [stats_service_1.StatsService])
], StatsResolver);
//# sourceMappingURL=stats.resolver.js.map