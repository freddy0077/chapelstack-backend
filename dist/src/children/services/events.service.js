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
const prisma_service_1 = require("../../prisma/prisma.service");
let EventsService = class EventsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createEventInput) {
        return this.prisma.childrenEvent.create({
            data: {
                ...createEventInput,
            },
        });
    }
    async findAll(branchId) {
        const where = branchId ? { branchId } : {};
        return this.prisma.childrenEvent.findMany({
            where,
            orderBy: { startDateTime: 'desc' },
        });
    }
    async findOne(id) {
        const event = await this.prisma.childrenEvent.findUnique({
            where: { id },
            include: {
                volunteerAssignments: {
                    include: {
                        volunteer: true,
                    },
                },
            },
        });
        if (!event) {
            throw new common_1.NotFoundException(`Event with ID ${id} not found`);
        }
        return event;
    }
    async update(id, updateEventInput) {
        await this.findOne(id);
        return this.prisma.childrenEvent.update({
            where: { id },
            data: {
                ...updateEventInput,
            },
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.childrenEvent.delete({
            where: { id },
        });
    }
    async findUpcomingEvents(branchId) {
        const now = new Date();
        return this.prisma.childrenEvent.findMany({
            where: {
                branchId,
                startDateTime: {
                    gte: now,
                },
            },
            orderBy: { startDateTime: 'asc' },
        });
    }
    async findPastEvents(branchId) {
        const now = new Date();
        return this.prisma.childrenEvent.findMany({
            where: {
                branchId,
                endDateTime: {
                    lt: now,
                },
            },
            orderBy: { startDateTime: 'desc' },
        });
    }
    async findCurrentEvents(branchId) {
        const now = new Date();
        return this.prisma.childrenEvent.findMany({
            where: {
                branchId,
                startDateTime: {
                    lte: now,
                },
                endDateTime: {
                    gte: now,
                },
            },
        });
    }
    async assignVolunteerToEvent(input) {
        const volunteer = await this.prisma.childrenMinistryVolunteer.findUnique({
            where: { id: input.volunteerId },
        });
        if (!volunteer) {
            throw new common_1.NotFoundException(`Volunteer with ID ${input.volunteerId} not found`);
        }
        const event = await this.prisma.childrenEvent.findUnique({
            where: { id: input.eventId },
        });
        if (!event) {
            throw new common_1.NotFoundException(`Event with ID ${input.eventId} not found`);
        }
        const existingAssignment = await this.prisma.volunteerEventAssignment.findFirst({
            where: {
                volunteerId: input.volunteerId,
                eventId: input.eventId,
            },
        });
        if (existingAssignment) {
            return this.prisma.volunteerEventAssignment.update({
                where: { id: existingAssignment.id },
                data: { role: input.role },
            });
        }
        return this.prisma.volunteerEventAssignment.create({
            data: input,
        });
    }
    async removeVolunteerFromEvent(volunteerId, eventId) {
        const assignment = await this.prisma.volunteerEventAssignment.findFirst({
            where: {
                volunteerId,
                eventId,
            },
        });
        if (!assignment) {
            throw new common_1.NotFoundException(`Assignment for volunteer ${volunteerId} and event ${eventId} not found`);
        }
        await this.prisma.volunteerEventAssignment.delete({
            where: { id: assignment.id },
        });
        return true;
    }
    async getEventAttendance(eventId) {
        const event = await this.prisma.childrenEvent.findUnique({
            where: { id: eventId },
        });
        if (!event) {
            throw new common_1.NotFoundException(`Event with ID ${eventId} not found`);
        }
        const checkIns = await this.prisma.checkInRecord.findMany({
            where: { eventId },
            include: {
                child: true,
                checkedInBy: true,
                checkedOutBy: true,
            },
        });
        const totalCheckedIn = checkIns.length;
        const totalCheckedOut = checkIns.filter((record) => record.checkedOutAt).length;
        return {
            event,
            checkIns,
            stats: {
                totalCheckedIn,
                totalCheckedOut,
                currentlyPresent: totalCheckedIn - totalCheckedOut,
            },
        };
    }
};
exports.EventsService = EventsService;
exports.EventsService = EventsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EventsService);
//# sourceMappingURL=events.service.js.map