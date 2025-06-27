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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaItemsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let MediaItemsService = class MediaItemsService {
    prisma;
    async countAll() {
        return 0;
    }
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createMediaItemInput) {
        return this.prisma.mediaItem.create({
            data: {
                title: createMediaItemInput.title,
                description: createMediaItemInput.description,
                fileUrl: createMediaItemInput.fileUrl,
                mimeType: createMediaItemInput.mimeType,
                fileSize: createMediaItemInput.fileSize,
                type: createMediaItemInput.type,
                branchId: createMediaItemInput.branchId,
                uploadedBy: createMediaItemInput.uploadedBy,
            },
        });
    }
    async findAll(branchId, type) {
        const where = {};
        if (branchId)
            where.branchId = branchId;
        if (type)
            where.type = type;
        return this.prisma.mediaItem.findMany({
            where,
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async findOne(id) {
        const mediaItem = await this.prisma.mediaItem.findUnique({
            where: { id },
        });
        if (!mediaItem) {
            throw new common_1.NotFoundException(`Media item with ID ${id} not found`);
        }
        return mediaItem;
    }
    async update(updateMediaItemInput) {
        const { id, ...rest } = updateMediaItemInput;
        const data = {};
        if (rest.title !== undefined)
            data.title = rest.title;
        if (rest.description !== undefined)
            data.description = rest.description;
        if (rest.fileUrl !== undefined)
            data.fileUrl = rest.fileUrl;
        if (rest.mimeType !== undefined)
            data.mimeType = rest.mimeType;
        if (rest.fileSize !== undefined)
            data.fileSize = rest.fileSize;
        if (rest.type !== undefined)
            data.type = rest.type;
        if (rest.branchId !== undefined)
            data.branchId = rest.branchId;
        await this.findOne(id);
        return this.prisma.mediaItem.update({
            where: { id },
            data,
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.mediaItem.delete({
            where: { id },
        });
    }
    async findByType(type, branchId) {
        const where = { type };
        if (branchId)
            where.branchId = branchId;
        return this.prisma.mediaItem.findMany({
            where,
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async search(query, branchId, type) {
        const where = {
            OR: [
                { title: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } },
            ],
        };
        if (branchId)
            where.branchId = branchId;
        if (type)
            where.type = type;
        return this.prisma.mediaItem.findMany({
            where,
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
};
exports.MediaItemsService = MediaItemsService;
exports.MediaItemsService = MediaItemsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MediaItemsService);
//# sourceMappingURL=media-items.service.js.map