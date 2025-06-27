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
exports.MinistriesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let MinistriesService = class MinistriesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(filters) {
        const where = filters
            ? {
                ...(filters.id && { id: filters.id }),
                ...(filters.name && {
                    name: {
                        contains: filters.name,
                        mode: client_1.Prisma.QueryMode.insensitive,
                    },
                }),
                ...(filters.type && { type: filters.type }),
                ...(filters.status && { status: filters.status }),
                ...(filters.branchId && { branchId: filters.branchId }),
                ...(filters.parentId && { parentId: filters.parentId }),
                ...(filters.organisationId && { organisationId: filters.organisationId }),
            }
            : {};
        return this.prisma.ministry.findMany({
            where,
            include: {
                subMinistries: true,
                members: true,
                smallGroups: true,
            },
        });
    }
    async findOne(id) {
        const ministry = await this.prisma.ministry.findUnique({
            where: { id },
            include: {
                subMinistries: true,
                members: true,
                smallGroups: true,
            },
        });
        if (!ministry) {
            throw new common_1.NotFoundException(`Ministry with ID ${id} not found`);
        }
        return ministry;
    }
    async create(input) {
        return this.prisma.ministry.create({
            data: {
                name: input.name,
                description: input.description,
                type: input.type,
                status: input.status,
                branchId: input.branchId,
                parentId: input.parentId,
            },
            include: {
                subMinistries: true,
                members: true,
                smallGroups: true,
            },
        });
    }
    async update(id, input) {
        const ministry = await this.prisma.ministry.findUnique({
            where: { id },
        });
        if (!ministry) {
            throw new common_1.NotFoundException(`Ministry with ID ${id} not found`);
        }
        return this.prisma.ministry.update({
            where: { id },
            data: {
                ...(input.name !== undefined && { name: input.name }),
                ...(input.description !== undefined && {
                    description: input.description,
                }),
                ...(input.type !== undefined && { type: input.type }),
                ...(input.status !== undefined && { status: input.status }),
                ...(input.branchId !== undefined && { branchId: input.branchId }),
                ...(input.parentId !== undefined && { parentId: input.parentId }),
            },
            include: {
                subMinistries: true,
                members: true,
                smallGroups: true,
            },
        });
    }
    async remove(id) {
        const ministry = await this.prisma.ministry.findUnique({
            where: { id },
        });
        if (!ministry) {
            throw new common_1.NotFoundException(`Ministry with ID ${id} not found`);
        }
        await this.prisma.ministry.delete({
            where: { id },
        });
        return true;
    }
    async getSubMinistries(ministryId) {
        return this.prisma.ministry.findMany({
            where: { parentId: ministryId },
        });
    }
    async getParentMinistry(ministryId) {
        const ministry = await this.prisma.ministry.findUnique({
            where: { id: ministryId },
            include: { parent: true },
        });
        return ministry?.parent || null;
    }
};
exports.MinistriesService = MinistriesService;
exports.MinistriesService = MinistriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MinistriesService);
//# sourceMappingURL=ministries.service.js.map