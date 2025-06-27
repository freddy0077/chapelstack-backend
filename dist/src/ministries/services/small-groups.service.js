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
exports.SmallGroupsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let SmallGroupsService = class SmallGroupsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(filters) {
        let where = {};
        if (filters) {
            if (filters.id)
                where.id = filters.id;
            if (filters.name)
                where.name = { contains: filters.name, mode: 'insensitive' };
            if (filters.type)
                where.type = filters.type;
            if (filters.status)
                where.status = filters.status;
            if (filters.branchId)
                where.branchId = filters.branchId;
            if (filters.organisationId)
                where.organisationId = filters.organisationId;
            if (filters.ministryId)
                where.ministryId = filters.ministryId;
            if (filters.search) {
                where.OR = [
                    { name: { contains: filters.search, mode: 'insensitive' } },
                    { description: { contains: filters.search, mode: 'insensitive' } },
                ];
            }
        }
        return this.prisma.smallGroup.findMany({
            where,
            include: {
                members: true,
                ministry: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async findOne(id) {
        const smallGroup = await this.prisma.smallGroup.findUnique({
            where: { id },
            include: {
                members: true,
                ministry: true,
            },
        });
        if (!smallGroup) {
            throw new common_1.NotFoundException(`Small Group with ID ${id} not found`);
        }
        return smallGroup;
    }
    async create(input) {
        if (input.ministryId) {
            const ministry = await this.prisma.ministry.findUnique({
                where: { id: input.ministryId },
            });
            if (!ministry) {
                throw new common_1.NotFoundException(`Ministry with ID ${input.ministryId} not found`);
            }
        }
        return this.prisma.smallGroup.create({
            data: {
                name: input.name,
                description: input.description,
                type: input.type,
                meetingSchedule: input.meetingSchedule,
                location: input.location,
                maximumCapacity: input.maximumCapacity,
                status: input.status,
                branchId: input.branchId,
                ministryId: input.ministryId,
            },
            include: {
                members: true,
                ministry: true,
            },
        });
    }
    async update(id, input) {
        const smallGroup = await this.prisma.smallGroup.findUnique({
            where: { id },
        });
        if (!smallGroup) {
            throw new common_1.NotFoundException(`Small Group with ID ${id} not found`);
        }
        if (input.ministryId && input.ministryId !== smallGroup.ministryId) {
            const ministry = await this.prisma.ministry.findUnique({
                where: { id: input.ministryId },
            });
            if (!ministry) {
                throw new common_1.NotFoundException(`Ministry with ID ${input.ministryId} not found`);
            }
        }
        return this.prisma.smallGroup.update({
            where: { id },
            data: {
                ...(input.name !== undefined && { name: input.name }),
                ...(input.description !== undefined && {
                    description: input.description,
                }),
                ...(input.type !== undefined && { type: input.type }),
                ...(input.meetingSchedule !== undefined && {
                    meetingSchedule: input.meetingSchedule,
                }),
                ...(input.location !== undefined && { location: input.location }),
                ...(input.maximumCapacity !== undefined && {
                    maximumCapacity: input.maximumCapacity,
                }),
                ...(input.status !== undefined && { status: input.status }),
                ...(input.branchId !== undefined && { branchId: input.branchId }),
                ...(input.ministryId !== undefined && { ministryId: input.ministryId }),
            },
            include: {
                members: true,
                ministry: true,
            },
        });
    }
    async remove(id) {
        const smallGroup = await this.prisma.smallGroup.findUnique({
            where: { id },
        });
        if (!smallGroup) {
            throw new common_1.NotFoundException(`Small Group with ID ${id} not found`);
        }
        await this.prisma.smallGroup.delete({
            where: { id },
        });
        return true;
    }
    async getGroupsByMinistry(ministryId) {
        return this.prisma.smallGroup.findMany({
            where: { ministryId },
            include: {
                members: true,
            },
        });
    }
};
exports.SmallGroupsService = SmallGroupsService;
exports.SmallGroupsService = SmallGroupsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SmallGroupsService);
//# sourceMappingURL=small-groups.service.js.map