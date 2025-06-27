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
exports.SermonsResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const sermons_service_1 = require("../services/sermons.service");
const create_sermon_input_1 = require("../dto/create-sermon.input");
const update_sermon_input_1 = require("../dto/update-sermon.input");
const content_status_enum_1 = require("../enums/content-status.enum");
const sermon_entity_1 = require("../entities/sermon.entity");
const sermon_mapper_1 = require("../mappers/sermon.mapper");
let SermonsResolver = class SermonsResolver {
    sermonsService;
    constructor(sermonsService) {
        this.sermonsService = sermonsService;
    }
    async create(createSermonInput) {
        const sermon = await this.sermonsService.create(createSermonInput);
        return (0, sermon_mapper_1.mapToSermonEntity)(sermon);
    }
    async findAll(branchId, speakerId, seriesId, status) {
        const sermons = await this.sermonsService.findAll(branchId, speakerId, seriesId, status);
        return (0, sermon_mapper_1.mapToSermonEntities)(sermons);
    }
    async findOne(id) {
        const sermon = await this.sermonsService.findOne(id);
        return (0, sermon_mapper_1.mapToSermonEntity)(sermon);
    }
    async update(updateSermonInput) {
        const sermon = await this.sermonsService.update(updateSermonInput);
        return (0, sermon_mapper_1.mapToSermonEntity)(sermon);
    }
    async remove(id) {
        const sermon = await this.sermonsService.remove(id);
        return (0, sermon_mapper_1.mapToSermonEntity)(sermon);
    }
    async updateSermonStatus(id, status) {
        const sermon = await this.sermonsService.updateStatus(id, status);
        return (0, sermon_mapper_1.mapToSermonEntity)(sermon);
    }
    async findRecent(limit, branchId) {
        const sermons = await this.sermonsService.findRecent(limit, branchId);
        return (0, sermon_mapper_1.mapToSermonEntities)(sermons);
    }
    async search(query, branchId) {
        const sermons = await this.sermonsService.search(query, branchId);
        return (0, sermon_mapper_1.mapToSermonEntities)(sermons);
    }
};
exports.SermonsResolver = SermonsResolver;
__decorate([
    (0, graphql_1.Mutation)(() => sermon_entity_1.SermonEntity),
    __param(0, (0, graphql_1.Args)('createSermonInput')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_sermon_input_1.CreateSermonInput]),
    __metadata("design:returntype", Promise)
], SermonsResolver.prototype, "create", null);
__decorate([
    (0, graphql_1.Query)(() => [sermon_entity_1.SermonEntity]),
    __param(0, (0, graphql_1.Args)('branchId', { nullable: true })),
    __param(1, (0, graphql_1.Args)('speakerId', { nullable: true })),
    __param(2, (0, graphql_1.Args)('seriesId', { nullable: true })),
    __param(3, (0, graphql_1.Args)('status', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], SermonsResolver.prototype, "findAll", null);
__decorate([
    (0, graphql_1.Query)(() => sermon_entity_1.SermonEntity),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SermonsResolver.prototype, "findOne", null);
__decorate([
    (0, graphql_1.Mutation)(() => sermon_entity_1.SermonEntity),
    __param(0, (0, graphql_1.Args)('updateSermonInput')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_sermon_input_1.UpdateSermonInput]),
    __metadata("design:returntype", Promise)
], SermonsResolver.prototype, "update", null);
__decorate([
    (0, graphql_1.Mutation)(() => sermon_entity_1.SermonEntity),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SermonsResolver.prototype, "remove", null);
__decorate([
    (0, graphql_1.Mutation)(() => sermon_entity_1.SermonEntity),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SermonsResolver.prototype, "updateSermonStatus", null);
__decorate([
    (0, graphql_1.Query)(() => [sermon_entity_1.SermonEntity]),
    __param(0, (0, graphql_1.Args)('limit', { nullable: true })),
    __param(1, (0, graphql_1.Args)('branchId', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], SermonsResolver.prototype, "findRecent", null);
__decorate([
    (0, graphql_1.Query)(() => [sermon_entity_1.SermonEntity]),
    __param(0, (0, graphql_1.Args)('query')),
    __param(1, (0, graphql_1.Args)('branchId', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SermonsResolver.prototype, "search", null);
exports.SermonsResolver = SermonsResolver = __decorate([
    (0, graphql_1.Resolver)(() => sermon_entity_1.SermonEntity),
    __metadata("design:paramtypes", [sermons_service_1.SermonsService])
], SermonsResolver);
//# sourceMappingURL=sermons.resolver.js.map