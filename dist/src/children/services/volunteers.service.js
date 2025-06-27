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
exports.VolunteersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let VolunteersService = class VolunteersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createVolunteerInput) {
        const member = await this.prisma.member.findUnique({
            where: { id: createVolunteerInput.memberId },
        });
        if (!member) {
            throw new common_1.NotFoundException(`Member with ID ${createVolunteerInput.memberId} not found`);
        }
        return this.prisma.childrenMinistryVolunteer.create({
            data: {
                ...createVolunteerInput,
            },
        });
    }
    async findAll(branchId, isActive) {
        const where = {};
        if (branchId) {
            where.branchId = branchId;
        }
        if (isActive !== undefined) {
            where.isActive = isActive;
        }
        return this.prisma.childrenMinistryVolunteer.findMany({
            where,
            include: {
                member: true,
            },
            orderBy: { member: { lastName: 'asc' } },
        });
    }
    async findOne(id) {
        const volunteer = await this.prisma.childrenMinistryVolunteer.findUnique({
            where: { id },
            include: {
                member: true,
                eventAssignments: {
                    include: {
                        event: true,
                    },
                },
            },
        });
        if (!volunteer) {
            throw new common_1.NotFoundException(`Volunteer with ID ${id} not found`);
        }
        return volunteer;
    }
    async update(id, updateVolunteerInput) {
        await this.findOne(id);
        return this.prisma.childrenMinistryVolunteer.update({
            where: { id },
            data: {
                ...updateVolunteerInput,
            },
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.childrenMinistryVolunteer.delete({
            where: { id },
        });
    }
    async findByMember(memberId) {
        return this.prisma.childrenMinistryVolunteer.findFirst({
            where: { memberId },
            include: {
                member: true,
            },
        });
    }
    async findByEvent(eventId) {
        return this.prisma.childrenMinistryVolunteer.findMany({
            where: {
                eventAssignments: {
                    some: {
                        eventId,
                    },
                },
            },
            include: {
                member: true,
                eventAssignments: {
                    where: {
                        eventId,
                    },
                },
            },
        });
    }
    async updateBackgroundCheck(id, backgroundCheckDate, backgroundCheckStatus) {
        await this.findOne(id);
        return this.prisma.childrenMinistryVolunteer.update({
            where: { id },
            data: {
                backgroundCheckDate,
                backgroundCheckStatus,
            },
        });
    }
    async updateTrainingCompletion(id, trainingCompletionDate) {
        await this.findOne(id);
        return this.prisma.childrenMinistryVolunteer.update({
            where: { id },
            data: {
                trainingCompletionDate,
            },
        });
    }
    async getVolunteerSchedule(id, startDate, endDate) {
        await this.findOne(id);
        const where = {
            volunteerId: id,
        };
        if (startDate || endDate) {
            where.event = {};
            if (startDate) {
                where.event.startDateTime = { gte: startDate };
            }
            if (endDate) {
                where.event.startDateTime = {
                    ...(where.event.startDateTime || {}),
                    lte: endDate,
                };
            }
        }
        const assignments = await this.prisma.volunteerEventAssignment.findMany({
            where,
            include: {
                event: true,
            },
            orderBy: {
                event: {
                    startDateTime: 'asc',
                },
            },
        });
        return assignments.map((assignment) => ({
            assignment,
            event: assignment.event,
        }));
    }
};
exports.VolunteersService = VolunteersService;
exports.VolunteersService = VolunteersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], VolunteersService);
//# sourceMappingURL=volunteers.service.js.map