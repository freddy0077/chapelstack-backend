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
exports.SeriesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let SeriesService = class SeriesService {
    prisma;
    async countActive() {
        return 0;
    }
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createSeriesInput) {
        return this.prisma.series.create({
            data: {
                title: createSeriesInput.title,
                description: createSeriesInput.description,
                startDate: createSeriesInput.startDate
                    ? new Date(createSeriesInput.startDate)
                    : null,
                endDate: createSeriesInput.endDate
                    ? new Date(createSeriesInput.endDate)
                    : null,
                artworkUrl: createSeriesInput.artworkUrl,
                branchId: createSeriesInput.branchId,
            },
        });
    }
    async findAll(branchId) {
        const where = branchId ? { branchId } : {};
        return this.prisma.series.findMany({
            where,
            include: {
                sermons: true,
            },
        });
    }
    async findOne(id) {
        const series = await this.prisma.series.findUnique({
            where: { id },
            include: {
                sermons: true,
            },
        });
        if (!series) {
            throw new common_1.NotFoundException(`Series with ID ${id} not found`);
        }
        return series;
    }
    async update(updateSeriesInput) {
        const { id, ...data } = updateSeriesInput;
        await this.findOne(id);
        const updateData = { ...data };
        if (data.startDate) {
            updateData.startDate = new Date(data.startDate);
        }
        if (data.endDate) {
            updateData.endDate = new Date(data.endDate);
        }
        return this.prisma.series.update({
            where: { id },
            data: updateData,
            include: {
                sermons: true,
            },
        });
    }
    async remove(id) {
        await this.findOne(id);
        const seriesWithSermons = await this.prisma.series.findUnique({
            where: { id },
            include: {
                sermons: {
                    take: 1,
                },
            },
        });
        if (seriesWithSermons && seriesWithSermons.sermons.length > 0) {
            throw new Error(`Cannot delete series with ID ${id} because it has associated sermons`);
        }
        return this.prisma.series.delete({
            where: { id },
        });
    }
    async getActiveSeries(branchId) {
        const today = new Date();
        return this.prisma.series.findMany({
            where: {
                branchId: branchId ? branchId : undefined,
                OR: [
                    {
                        endDate: {
                            gte: today,
                        },
                    },
                    {
                        endDate: null,
                    },
                ],
            },
            include: {
                sermons: true,
            },
            orderBy: {
                startDate: 'desc',
            },
        });
    }
};
exports.SeriesService = SeriesService;
exports.SeriesService = SeriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SeriesService);
//# sourceMappingURL=series.service.js.map