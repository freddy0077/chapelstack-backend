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
exports.CheckinService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let CheckinService = class CheckinService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async checkIn(checkInInput) {
        const child = await this.prisma.child.findUnique({
            where: { id: checkInInput.childId },
        });
        if (!child) {
            throw new common_1.NotFoundException(`Child with ID ${checkInInput.childId} not found`);
        }
        const guardian = await this.prisma.guardian.findUnique({
            where: { id: checkInInput.guardianIdAtCheckIn },
        });
        if (!guardian) {
            throw new common_1.NotFoundException(`Guardian with ID ${checkInInput.guardianIdAtCheckIn} not found`);
        }
        const guardianRelation = await this.prisma.childGuardianRelation.findFirst({
            where: {
                childId: checkInInput.childId,
                guardianId: checkInInput.guardianIdAtCheckIn,
            },
        });
        if (!guardianRelation) {
            throw new common_1.BadRequestException(`Guardian is not authorized for this child`);
        }
        if (checkInInput.eventId) {
            const event = await this.prisma.childrenEvent.findUnique({
                where: { id: checkInInput.eventId },
            });
            if (!event) {
                throw new common_1.NotFoundException(`Event with ID ${checkInInput.eventId} not found`);
            }
        }
        const activeCheckIn = await this.prisma.checkInRecord.findFirst({
            where: {
                childId: checkInInput.childId,
                checkedOutAt: null,
            },
        });
        if (activeCheckIn) {
            throw new common_1.BadRequestException(`Child is already checked in and not checked out`);
        }
        return this.prisma.checkInRecord.create({
            data: {
                childId: checkInInput.childId,
                eventId: checkInInput.eventId,
                checkedInById: checkInInput.checkedInById,
                guardianIdAtCheckIn: checkInInput.guardianIdAtCheckIn,
                notes: checkInInput.notes,
                branchId: checkInInput.branchId,
            },
            include: {
                child: true,
                event: true,
                checkedInBy: true,
            },
        });
    }
    async checkOut(checkOutInput) {
        const checkInRecord = await this.prisma.checkInRecord.findUnique({
            where: { id: checkOutInput.checkInRecordId },
        });
        if (!checkInRecord) {
            throw new common_1.NotFoundException(`Check-in record with ID ${checkOutInput.checkInRecordId} not found`);
        }
        if (checkInRecord.checkedOutAt) {
            throw new common_1.BadRequestException(`Child is already checked out`);
        }
        const guardian = await this.prisma.guardian.findUnique({
            where: { id: checkOutInput.guardianIdAtCheckOut },
        });
        if (!guardian) {
            throw new common_1.NotFoundException(`Guardian with ID ${checkOutInput.guardianIdAtCheckOut} not found`);
        }
        const guardianRelation = await this.prisma.childGuardianRelation.findFirst({
            where: {
                childId: checkInRecord.childId,
                guardianId: checkOutInput.guardianIdAtCheckOut,
            },
        });
        if (!guardianRelation && !guardian.canPickup) {
            throw new common_1.BadRequestException(`Guardian is not authorized to pick up this child`);
        }
        return this.prisma.checkInRecord.update({
            where: { id: checkOutInput.checkInRecordId },
            data: {
                checkedOutById: checkOutInput.checkedOutById,
                checkedOutAt: new Date(),
                guardianIdAtCheckOut: checkOutInput.guardianIdAtCheckOut,
                notes: checkOutInput.notes
                    ? `${checkInRecord.notes || ''}\nCheck-out notes: ${checkOutInput.notes}`
                    : checkInRecord.notes,
            },
            include: {
                child: true,
                event: true,
                checkedInBy: true,
                checkedOutBy: true,
            },
        });
    }
    async findActiveCheckIns(branchId, eventId) {
        const where = {
            branchId,
            checkedOutAt: null,
        };
        if (eventId) {
            where.eventId = eventId;
        }
        return this.prisma.checkInRecord.findMany({
            where,
            include: {
                child: true,
                event: true,
                checkedInBy: true,
            },
            orderBy: { checkedInAt: 'desc' },
        });
    }
    async findCheckInHistory(branchId, dateFrom, dateTo, childId, eventId) {
        const where = { branchId };
        if (childId) {
            where.childId = childId;
        }
        if (eventId) {
            where.eventId = eventId;
        }
        if (dateFrom || dateTo) {
            where.checkedInAt = {};
            if (dateFrom) {
                where.checkedInAt.gte = dateFrom;
            }
            if (dateTo) {
                where.checkedInAt.lte = dateTo;
            }
        }
        return this.prisma.checkInRecord.findMany({
            where,
            include: {
                child: true,
                event: true,
                checkedInBy: true,
                checkedOutBy: true,
            },
            orderBy: { checkedInAt: 'desc' },
        });
    }
    async getCheckInStats(branchId, dateFrom, dateTo) {
        const where = { branchId };
        if (dateFrom || dateTo) {
            where.checkedInAt = {};
            if (dateFrom) {
                where.checkedInAt.gte = dateFrom;
            }
            if (dateTo) {
                where.checkedInAt.lte = dateTo;
            }
        }
        const totalCheckIns = await this.prisma.checkInRecord.count({ where });
        where.checkedOutAt = { not: null };
        const totalCheckOuts = await this.prisma.checkInRecord.count({ where });
        const uniqueChildren = await this.prisma.checkInRecord.groupBy({
            by: ['childId'],
            where,
        });
        const checkInsByEvent = await this.prisma.checkInRecord.groupBy({
            by: ['eventId'],
            where,
            _count: true,
        });
        return {
            totalCheckIns,
            totalCheckOuts,
            uniqueChildrenCount: uniqueChildren.length,
            checkInsByEvent,
        };
    }
};
exports.CheckinService = CheckinService;
exports.CheckinService = CheckinService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CheckinService);
//# sourceMappingURL=checkin.service.js.map