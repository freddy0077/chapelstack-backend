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
exports.SermonsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let SermonsService = class SermonsService {
    prisma;
    async countAll() {
        return this.prisma.sermon.count();
    }
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createSermonInput) {
        const speaker = await this.prisma.speaker.findUnique({
            where: { id: createSermonInput.speakerId },
        });
        if (!speaker) {
            throw new common_1.NotFoundException(`Speaker with ID ${createSermonInput.speakerId} not found`);
        }
        if (createSermonInput.seriesId) {
            const series = await this.prisma.series.findUnique({
                where: { id: createSermonInput.seriesId },
            });
            if (!series) {
                throw new common_1.NotFoundException(`Series with ID ${createSermonInput.seriesId} not found`);
            }
        }
        return this.prisma.sermon.create({
            data: {
                title: createSermonInput.title,
                description: createSermonInput.description,
                datePreached: new Date(createSermonInput.datePreached),
                mainScripture: createSermonInput.mainScripture,
                audioUrl: createSermonInput.audioUrl,
                videoUrl: createSermonInput.videoUrl,
                transcriptUrl: createSermonInput.transcriptUrl,
                transcriptText: createSermonInput.transcriptText,
                duration: createSermonInput.duration,
                status: createSermonInput.status || client_1.ContentStatus.DRAFT,
                speaker: {
                    connect: { id: createSermonInput.speakerId },
                },
                branch: {
                    connect: { id: createSermonInput.branchId },
                },
                ...(createSermonInput.seriesId && {
                    series: {
                        connect: { id: createSermonInput.seriesId },
                    },
                }),
            },
            include: {
                speaker: true,
                series: true,
            },
        });
    }
    async findAll(branchId, speakerId, seriesId, status) {
        const where = {};
        if (branchId)
            where.branchId = branchId;
        if (speakerId)
            where.speakerId = speakerId;
        if (seriesId)
            where.seriesId = seriesId;
        if (status)
            where.status = status;
        return this.prisma.sermon.findMany({
            where,
            include: {
                speaker: true,
                series: true,
            },
            orderBy: {
                datePreached: 'desc',
            },
        });
    }
    async findOne(id) {
        const sermon = await this.prisma.sermon.findUnique({
            where: { id },
            include: {
                speaker: true,
                series: true,
            },
        });
        if (!sermon) {
            throw new common_1.NotFoundException(`Sermon with ID ${id} not found`);
        }
        return sermon;
    }
    async update(updateSermonInput) {
        const { id, speakerId, seriesId, datePreached, ...data } = updateSermonInput;
        await this.findOne(id);
        if (speakerId) {
            const speaker = await this.prisma.speaker.findUnique({
                where: { id: speakerId },
            });
            if (!speaker) {
                throw new common_1.NotFoundException(`Speaker with ID ${speakerId} not found`);
            }
        }
        if (seriesId) {
            const series = await this.prisma.series.findUnique({
                where: { id: seriesId },
            });
            if (!series) {
                throw new common_1.NotFoundException(`Series with ID ${seriesId} not found`);
            }
        }
        const updateData = { ...data };
        if (datePreached) {
            updateData.datePreached = new Date(datePreached);
        }
        if (speakerId) {
            updateData.speaker = { connect: { id: speakerId } };
        }
        if (seriesId) {
            updateData.series = { connect: { id: seriesId } };
        }
        else if (seriesId === null) {
            updateData.series = { disconnect: true };
        }
        return this.prisma.sermon.update({
            where: { id },
            data: updateData,
            include: {
                speaker: true,
                series: true,
            },
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.sermon.delete({
            where: { id },
        });
    }
    async updateStatus(id, status) {
        await this.findOne(id);
        return this.prisma.sermon.update({
            where: { id },
            data: { status },
            include: {
                speaker: true,
                series: true,
            },
        });
    }
    async findRecent(limit = 5, branchId) {
        const where = { status: client_1.ContentStatus.PUBLISHED };
        if (branchId)
            where.branchId = branchId;
        return this.prisma.sermon.findMany({
            where,
            take: limit,
            orderBy: {
                datePreached: 'desc',
            },
            include: {
                speaker: true,
                series: true,
            },
        });
    }
    async search(query, branchId) {
        const where = {
            status: client_1.ContentStatus.PUBLISHED,
            OR: [
                { title: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } },
                { mainScripture: { contains: query, mode: 'insensitive' } },
                { transcriptText: { contains: query, mode: 'insensitive' } },
            ],
        };
        if (branchId)
            where.branchId = branchId;
        return this.prisma.sermon.findMany({
            where,
            include: {
                speaker: true,
                series: true,
            },
            orderBy: {
                datePreached: 'desc',
            },
        });
    }
};
exports.SermonsService = SermonsService;
exports.SermonsService = SermonsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SermonsService);
//# sourceMappingURL=sermons.service.js.map