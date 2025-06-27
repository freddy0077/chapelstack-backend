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
exports.MediaItemsResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const media_items_service_1 = require("../services/media-items.service");
const create_media_item_input_1 = require("../dto/create-media-item.input");
const update_media_item_input_1 = require("../dto/update-media-item.input");
const client_1 = require("@prisma/client");
const media_item_entity_1 = require("../entities/media-item.entity");
const media_item_mapper_1 = require("../mappers/media-item.mapper");
let MediaItemsResolver = class MediaItemsResolver {
    mediaItemsService;
    constructor(mediaItemsService) {
        this.mediaItemsService = mediaItemsService;
    }
    async create(createMediaItemInput) {
        const mediaItem = await this.mediaItemsService.create(createMediaItemInput);
        return (0, media_item_mapper_1.mapToMediaItemEntity)(mediaItem);
    }
    async findAll(branchId, type) {
        const mediaItems = await this.mediaItemsService.findAll(branchId, type);
        return (0, media_item_mapper_1.mapToMediaItemEntities)(mediaItems);
    }
    async findOne(id) {
        const mediaItem = await this.mediaItemsService.findOne(id);
        return (0, media_item_mapper_1.mapToMediaItemEntity)(mediaItem);
    }
    async update(updateMediaItemInput) {
        const mediaItem = await this.mediaItemsService.update(updateMediaItemInput);
        return (0, media_item_mapper_1.mapToMediaItemEntity)(mediaItem);
    }
    async remove(id) {
        const mediaItem = await this.mediaItemsService.remove(id);
        return (0, media_item_mapper_1.mapToMediaItemEntity)(mediaItem);
    }
    async findByType(type, branchId) {
        const mediaItems = await this.mediaItemsService.findByType(type, branchId);
        return (0, media_item_mapper_1.mapToMediaItemEntities)(mediaItems);
    }
    async search(query, branchId, type) {
        const mediaItems = await this.mediaItemsService.search(query, branchId, type);
        return (0, media_item_mapper_1.mapToMediaItemEntities)(mediaItems);
    }
};
exports.MediaItemsResolver = MediaItemsResolver;
__decorate([
    (0, graphql_1.Mutation)(() => media_item_entity_1.MediaItemEntity),
    __param(0, (0, graphql_1.Args)('createMediaItemInput')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_media_item_input_1.CreateMediaItemInput]),
    __metadata("design:returntype", Promise)
], MediaItemsResolver.prototype, "create", null);
__decorate([
    (0, graphql_1.Query)(() => [media_item_entity_1.MediaItemEntity]),
    __param(0, (0, graphql_1.Args)('branchId', { nullable: true })),
    __param(1, (0, graphql_1.Args)('type', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MediaItemsResolver.prototype, "findAll", null);
__decorate([
    (0, graphql_1.Query)(() => media_item_entity_1.MediaItemEntity),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MediaItemsResolver.prototype, "findOne", null);
__decorate([
    (0, graphql_1.Mutation)(() => media_item_entity_1.MediaItemEntity),
    __param(0, (0, graphql_1.Args)('updateMediaItemInput')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_media_item_input_1.UpdateMediaItemInput]),
    __metadata("design:returntype", Promise)
], MediaItemsResolver.prototype, "update", null);
__decorate([
    (0, graphql_1.Mutation)(() => media_item_entity_1.MediaItemEntity),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MediaItemsResolver.prototype, "remove", null);
__decorate([
    (0, graphql_1.Query)(() => [media_item_entity_1.MediaItemEntity]),
    __param(0, (0, graphql_1.Args)('type')),
    __param(1, (0, graphql_1.Args)('branchId', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MediaItemsResolver.prototype, "findByType", null);
__decorate([
    (0, graphql_1.Query)(() => [media_item_entity_1.MediaItemEntity]),
    __param(0, (0, graphql_1.Args)('query')),
    __param(1, (0, graphql_1.Args)('branchId', { nullable: true })),
    __param(2, (0, graphql_1.Args)('type', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], MediaItemsResolver.prototype, "search", null);
exports.MediaItemsResolver = MediaItemsResolver = __decorate([
    (0, graphql_1.Resolver)(() => media_item_entity_1.MediaItemEntity),
    __metadata("design:paramtypes", [media_items_service_1.MediaItemsService])
], MediaItemsResolver);
//# sourceMappingURL=media-items.resolver.js.map