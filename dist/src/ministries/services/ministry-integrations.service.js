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
exports.MinistryIntegrationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let MinistryIntegrationsService = class MinistryIntegrationsService {
    prisma;
    logger;
    constructor(prisma, logger) {
        this.prisma = prisma;
        this.logger = logger;
    }
    modelExists(modelName) {
        return this.prisma[modelName] !== undefined;
    }
    getModel(modelName) {
        if (!this.modelExists(modelName)) {
            this.logger.warn(`${modelName} model not available in Prisma client`, 'MinistryIntegrationsService');
            return null;
        }
        return this.prisma[modelName];
    }
    async getMinistryEvents(ministryId) {
        try {
            const eventModel = this.getModel('event');
            if (!eventModel) {
                return [];
            }
            return await eventModel.findMany({
                where: { ministryId },
            });
        }
        catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
            this.logger.error(`Error getting ministry events: ${err.message}`, err.stack, 'MinistryIntegrationsService');
            return [];
        }
    }
    async getSmallGroupEvents(smallGroupId) {
        try {
            const eventModel = this.getModel('event');
            if (!eventModel) {
                return [];
            }
            return await eventModel.findMany({
                where: { smallGroupId },
            });
        }
        catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
            this.logger.error(`Error getting small group events: ${err.message}`, err.stack, 'MinistryIntegrationsService');
            return [];
        }
    }
    async recordMinistryAttendance(ministryId, eventId, attendees) {
        try {
            const ministryMembers = await this.prisma.groupMember.findMany({
                where: {
                    ministryId,
                    status: 'ACTIVE',
                },
                select: {
                    memberId: true,
                },
            });
            const memberIds = ministryMembers.map((member) => member.memberId);
            const invalidAttendees = attendees.filter((attendeeId) => !memberIds.includes(attendeeId));
            if (invalidAttendees.length > 0) {
                throw new Error(`The following attendees are not members of this ministry: ${invalidAttendees.join(', ')}`);
            }
            const attendanceModel = this.getModel('attendance');
            if (!attendanceModel) {
                return false;
            }
            for (const attendeeId of attendees) {
                await attendanceModel.create({
                    data: {
                        eventId,
                        memberId: attendeeId,
                        status: 'PRESENT',
                        notes: 'Recorded via ministry integration',
                    },
                });
            }
            return true;
        }
        catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
            this.logger.error(`Error recording ministry attendance: ${err.message}`, err.stack, 'MinistryIntegrationsService');
            return false;
        }
    }
    async recordSmallGroupAttendance(smallGroupId, eventId, attendees) {
        try {
            const smallGroupMembers = await this.prisma.groupMember.findMany({
                where: {
                    smallGroupId,
                    status: 'ACTIVE',
                },
                select: {
                    memberId: true,
                },
            });
            const memberIds = smallGroupMembers.map((member) => member.memberId);
            const invalidAttendees = attendees.filter((attendeeId) => !memberIds.includes(attendeeId));
            if (invalidAttendees.length > 0) {
                throw new Error(`The following attendees are not members of this small group: ${invalidAttendees.join(', ')}`);
            }
            const attendanceModel = this.getModel('attendance');
            if (!attendanceModel) {
                return false;
            }
            for (const attendeeId of attendees) {
                await attendanceModel.create({
                    data: {
                        eventId,
                        memberId: attendeeId,
                        status: 'PRESENT',
                        notes: 'Recorded via small group integration',
                    },
                });
            }
            return true;
        }
        catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
            this.logger.error(`Error recording small group attendance: ${err.message}`, err.stack, 'MinistryIntegrationsService');
            return false;
        }
    }
    async sendMinistryMessage(ministryId, subject, message, senderId) {
        try {
            const ministryMembers = await this.prisma.groupMember.findMany({
                where: {
                    ministryId,
                    status: 'ACTIVE',
                },
                select: {
                    memberId: true,
                },
            });
            if (ministryMembers.length === 0) {
                this.logger.warn(`No active members found for ministry ${ministryId}`, 'MinistryIntegrationsService');
                return false;
            }
            const messageModel = this.getModel('message');
            if (!messageModel) {
                return false;
            }
            const messageRecord = await messageModel.create({
                data: {
                    subject,
                    content: message,
                    senderId,
                    type: 'GROUP',
                    status: 'SENT',
                    metadata: {
                        groupType: 'MINISTRY',
                        groupId: ministryId,
                    },
                },
            });
            const messageRecipientModel = this.getModel('messageRecipient');
            if (!messageRecipientModel) {
                return false;
            }
            for (const member of ministryMembers) {
                await messageRecipientModel.create({
                    data: {
                        messageId: messageRecord.id,
                        recipientId: member.memberId,
                        status: 'DELIVERED',
                    },
                });
            }
            return true;
        }
        catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
            this.logger.error(`Error sending ministry message: ${err.message}`, err.stack, 'MinistryIntegrationsService');
            return false;
        }
    }
    async sendSmallGroupMessage(smallGroupId, subject, message, senderId) {
        try {
            const smallGroupMembers = await this.prisma.groupMember.findMany({
                where: {
                    smallGroupId,
                    status: 'ACTIVE',
                },
                select: {
                    memberId: true,
                },
            });
            if (smallGroupMembers.length === 0) {
                this.logger.warn(`No active members found for small group ${smallGroupId}`, 'MinistryIntegrationsService');
                return false;
            }
            const messageModel = this.getModel('message');
            if (!messageModel) {
                return false;
            }
            const messageRecord = await messageModel.create({
                data: {
                    subject,
                    content: message,
                    senderId,
                    type: 'GROUP',
                    status: 'SENT',
                    metadata: {
                        groupType: 'SMALL_GROUP',
                        groupId: smallGroupId,
                    },
                },
            });
            const messageRecipientModel = this.getModel('messageRecipient');
            if (!messageRecipientModel) {
                return false;
            }
            for (const member of smallGroupMembers) {
                await messageRecipientModel.create({
                    data: {
                        messageId: messageRecord.id,
                        recipientId: member.memberId,
                        status: 'DELIVERED',
                    },
                });
            }
            return true;
        }
        catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
            this.logger.error(`Error sending small group message: ${err.message}`, err.stack, 'MinistryIntegrationsService');
            return false;
        }
    }
    async getMinistryAttendanceStats(ministryId) {
        try {
            const eventModel = this.getModel('event');
            if (!eventModel) {
                return {
                    totalEvents: 0,
                    totalAttendance: 0,
                    averageAttendance: 0,
                };
            }
            const ministryEvents = await eventModel.findMany({
                where: { ministryId },
            });
            const attendanceModel = this.getModel('attendance');
            if (!attendanceModel || ministryEvents.length === 0) {
                return {
                    totalEvents: ministryEvents?.length || 0,
                    totalAttendance: 0,
                    averageAttendance: 0,
                };
            }
            const eventIds = ministryEvents.map((event) => event.id);
            const attendanceRecords = await attendanceModel.findMany({
                where: {
                    eventId: {
                        in: eventIds,
                    },
                },
            });
            const totalEvents = ministryEvents.length;
            const totalAttendance = attendanceRecords.length;
            const averageAttendance = totalEvents > 0 ? totalAttendance / totalEvents : 0;
            return {
                totalEvents,
                totalAttendance,
                averageAttendance,
            };
        }
        catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
            this.logger.error(`Error getting ministry attendance stats: ${err.message}`, err.stack, 'MinistryIntegrationsService');
            return {
                totalEvents: 0,
                totalAttendance: 0,
                averageAttendance: 0,
            };
        }
    }
    async getSmallGroupAttendanceStats(smallGroupId) {
        try {
            const eventModel = this.getModel('event');
            if (!eventModel) {
                return {
                    totalEvents: 0,
                    totalAttendance: 0,
                    averageAttendance: 0,
                };
            }
            const smallGroupEvents = await eventModel.findMany({
                where: { smallGroupId },
            });
            const attendanceModel = this.getModel('attendance');
            if (!attendanceModel || smallGroupEvents.length === 0) {
                return {
                    totalEvents: smallGroupEvents?.length || 0,
                    totalAttendance: 0,
                    averageAttendance: 0,
                };
            }
            const eventIds = smallGroupEvents.map((event) => event.id);
            const attendanceRecords = await attendanceModel.findMany({
                where: {
                    eventId: {
                        in: eventIds,
                    },
                },
            });
            const totalEvents = smallGroupEvents.length;
            const totalAttendance = attendanceRecords.length;
            const averageAttendance = totalEvents > 0 ? totalAttendance / totalEvents : 0;
            return {
                totalEvents,
                totalAttendance,
                averageAttendance,
            };
        }
        catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
            this.logger.error(`Error getting small group attendance stats: ${err.message}`, err.stack, 'MinistryIntegrationsService');
            return {
                totalEvents: 0,
                totalAttendance: 0,
                averageAttendance: 0,
            };
        }
    }
};
exports.MinistryIntegrationsService = MinistryIntegrationsService;
exports.MinistryIntegrationsService = MinistryIntegrationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        common_1.Logger])
], MinistryIntegrationsService);
//# sourceMappingURL=ministry-integrations.service.js.map