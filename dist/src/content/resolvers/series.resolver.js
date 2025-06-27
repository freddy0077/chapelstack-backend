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
exports.SeriesResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const series_service_1 = require("../services/series.service");
const create_series_input_1 = require("../dto/create-series.input");
const update_series_input_1 = require("../dto/update-series.input");
const series_entity_1 = require("../entities/series.entity");
const series_mapper_1 = require("../mappers/series.mapper");
let SeriesResolver = class SeriesResolver {
    seriesService;
    constructor(seriesService) {
        this.seriesService = seriesService;
    }
    async create(createSeriesInput) {
        const series = await this.seriesService.create(createSeriesInput);
        return (0, series_mapper_1.mapToSeriesEntity)(series);
    }
    async findAll(branchId) {
        const seriesArray = await this.seriesService.findAll(branchId);
        return (0, series_mapper_1.mapToSeriesEntities)(seriesArray);
    }
    async findOne(id) {
        const series = await this.seriesService.findOne(id);
        return (0, series_mapper_1.mapToSeriesEntity)(series);
    }
    async update(updateSeriesInput) {
        const series = await this.seriesService.update(updateSeriesInput);
        return (0, series_mapper_1.mapToSeriesEntity)(series);
    }
    async remove(id) {
        const series = await this.seriesService.remove(id);
        return (0, series_mapper_1.mapToSeriesEntity)(series);
    }
    async getActiveSeries(branchId) {
        const seriesArray = await this.seriesService.getActiveSeries(branchId);
        return (0, series_mapper_1.mapToSeriesEntities)(seriesArray);
    }
};
exports.SeriesResolver = SeriesResolver;
__decorate([
    (0, graphql_1.Mutation)(() => series_entity_1.SeriesEntity),
    __param(0, (0, graphql_1.Args)('createSeriesInput')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_series_input_1.CreateSeriesInput]),
    __metadata("design:returntype", Promise)
], SeriesResolver.prototype, "create", null);
__decorate([
    (0, graphql_1.Query)(() => [series_entity_1.SeriesEntity]),
    __param(0, (0, graphql_1.Args)('branchId', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SeriesResolver.prototype, "findAll", null);
__decorate([
    (0, graphql_1.Query)(() => series_entity_1.SeriesEntity),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SeriesResolver.prototype, "findOne", null);
__decorate([
    (0, graphql_1.Mutation)(() => series_entity_1.SeriesEntity),
    __param(0, (0, graphql_1.Args)('updateSeriesInput')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_series_input_1.UpdateSeriesInput]),
    __metadata("design:returntype", Promise)
], SeriesResolver.prototype, "update", null);
__decorate([
    (0, graphql_1.Mutation)(() => series_entity_1.SeriesEntity),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SeriesResolver.prototype, "remove", null);
__decorate([
    (0, graphql_1.Query)(() => [series_entity_1.SeriesEntity]),
    __param(0, (0, graphql_1.Args)('branchId', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SeriesResolver.prototype, "getActiveSeries", null);
exports.SeriesResolver = SeriesResolver = __decorate([
    (0, graphql_1.Resolver)(() => series_entity_1.SeriesEntity),
    __metadata("design:paramtypes", [series_service_1.SeriesService])
], SeriesResolver);
//# sourceMappingURL=series.resolver.js.map