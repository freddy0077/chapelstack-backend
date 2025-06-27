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
exports.EventsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let EventsService = class EventsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(input) {
        console.log('EventsService.create received input:', input);
        console.log('Input type:', typeof input);
        console.log('Input constructor:', input?.constructor?.name);
        console.log('Input properties:', Object.getOwnPropertyNames(input || {}));
        console.log('Input title:', input?.title);
        console.log('Input startDate:', input?.startDate);
        if (!input || !input.title) {
            throw new Error('Event title is required');
        }
        const data = { ...input };
        Object.keys(data).forEach((key) => {
            if (data[key] === undefined) {
                delete data[key];
            }
        });
        console.log('Data for Prisma after cleaning:', data);
        console.log('Data has title?', Boolean(data.title));
        try {
            return await this.prisma.event.create({ data });
        }
        catch (error) {
            console.error('Prisma create error:', error);
            throw error;
        }
    }
    async findAll({ branchId, organisationId }) {
        const where = {};
        if (branchId) {
            where.branchId = branchId;
        }
        if (organisationId) {
            where.organisationId = organisationId;
        }
        return this.prisma.event.findMany({ where });
    }
    async findOne(id) {
        const event = await this.prisma.event.findUnique({ where: { id } });
        if (!event)
            throw new common_1.NotFoundException('Event not found');
        return event;
    }
    async update(id, input) {
        try {
            return await this.prisma.event.update({ where: { id }, data: input });
        }
        catch (error) {
            throw new common_1.NotFoundException('Event not found');
        }
    }
    async remove(id) {
        try {
            return await this.prisma.event.delete({ where: { id } });
        }
        catch (error) {
            throw new common_1.NotFoundException('Event not found');
        }
    }
};
exports.EventsService = EventsService;
exports.EventsService = EventsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EventsService);
//# sourceMappingURL=events.service.js.map