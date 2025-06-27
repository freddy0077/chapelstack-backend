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
exports.AttendanceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const create_attendance_session_input_1 = require("./dto/create-attendance-session.input");
const crypto_1 = require("crypto");
let AttendanceService = class AttendanceService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createAttendanceSession(data) {
        const { branchId, organisationId, ...restData } = data;
        const organisation = await this.prisma.organisation.findUnique({
            where: { id: organisationId },
        });
        if (!organisation) {
            throw new common_1.NotFoundException(`Organisation with ID ${organisationId} not found`);
        }
        const createData = {
            ...restData,
            status: data.status || create_attendance_session_input_1.SessionStatus.PLANNED,
            organisation: { connect: { id: organisationId } },
        };
        if (branchId) {
            const branch = await this.prisma.branch.findUnique({
                where: { id: branchId },
            });
            if (!branch) {
                throw new common_1.NotFoundException(`Branch with ID ${branchId} not found`);
            }
            if (branch.organisationId !== organisationId) {
                throw new common_1.BadRequestException(`Branch with ID ${branchId} does not belong to organisation with ID ${organisationId}`);
            }
            createData.branch = { connect: { id: branchId } };
        }
        return this.prisma.attendanceSession.create({
            data: createData,
        });
    }
    async findAllAttendanceSessions(params) {
        const where = {};
        if (params.branchId) {
            where.branchId = params.branchId;
        }
        else if (params.organisationId) {
            where.organisationId = params.organisationId;
        }
        return await this.prisma.attendanceSession.findMany({
            where,
            orderBy: {
                date: 'desc',
            },
        });
    }
    async findAttendanceSessionById(id) {
        const session = await this.prisma.attendanceSession.findUnique({
            where: { id },
            include: {
                attendanceRecords: true,
            },
        });
        if (!session) {
            throw new common_1.NotFoundException(`Attendance session with ID ${id} not found`);
        }
        return session;
    }
    async updateAttendanceSession(data) {
        const existingSession = await this.prisma.attendanceSession.findUnique({
            where: { id: data.id },
        });
        if (!existingSession) {
            throw new common_1.NotFoundException(`Attendance session with ID ${data.id} not found`);
        }
        if (data.branchId) {
            const branch = await this.prisma.branch.findUnique({
                where: { id: data.branchId },
            });
            if (!branch) {
                throw new common_1.NotFoundException(`Branch with ID ${data.branchId} not found`);
            }
        }
        return this.prisma.attendanceSession.update({
            where: { id: data.id },
            data: {
                name: data.name,
                description: data.description,
                date: data.date,
                startTime: data.startTime,
                endTime: data.endTime,
                type: data.type,
                status: data.status,
                location: data.location,
                latitude: data.latitude,
                longitude: data.longitude,
                branchId: data.branchId,
            },
        });
    }
    async deleteAttendanceSession(id) {
        const existingSession = await this.prisma.attendanceSession.findUnique({
            where: { id },
        });
        if (!existingSession) {
            throw new common_1.NotFoundException(`Attendance session with ID ${id} not found`);
        }
        return this.prisma.attendanceSession.delete({
            where: { id },
        });
    }
    async recordAttendance(data) {
        const session = await this.prisma.attendanceSession.findUnique({
            where: { id: data.sessionId },
        });
        if (!session) {
            throw new common_1.NotFoundException(`Attendance session with ID ${data.sessionId} not found`);
        }
        if (data.memberId) {
            const member = await this.prisma.member.findUnique({
                where: { id: data.memberId },
            });
            if (!member) {
                throw new common_1.NotFoundException(`Member with ID ${data.memberId} not found`);
            }
        }
        else if (!data.visitorName) {
            throw new common_1.BadRequestException('Either memberId or visitorName must be provided');
        }
        return this.prisma.attendanceRecord.create({
            data: {
                checkInTime: data.checkInTime || new Date(),
                checkInMethod: data.checkInMethod,
                notes: data.notes,
                session: {
                    connect: {
                        id: data.sessionId,
                    },
                },
                member: data.memberId
                    ? {
                        connect: {
                            id: data.memberId,
                        },
                    }
                    : undefined,
                visitorName: data.visitorName,
                visitorEmail: data.visitorEmail,
                visitorPhone: data.visitorPhone,
                branch: data.branchId || (session.branchId && session.branchId !== null)
                    ? { connect: { id: data.branchId || session.branchId } }
                    : undefined,
                recordedBy: data.recordedById
                    ? { connect: { id: data.recordedById } }
                    : undefined,
            },
            include: {
                member: true,
                session: true,
                recordedBy: true,
                branch: true,
            },
        });
    }
    async recordBulkAttendance(data) {
        const session = await this.prisma.attendanceSession.findUnique({
            where: { id: data.sessionId },
        });
        if (!session) {
            throw new common_1.NotFoundException(`Attendance session with ID ${data.sessionId} not found`);
        }
        if (data.attendanceRecords && data.attendanceRecords.length > 0) {
            const records = await Promise.all(data.attendanceRecords.map((record) => this.recordAttendance({
                ...record,
                sessionId: data.sessionId,
                branchId: data.branchId || session.branchId,
            })));
            return {
                success: true,
                count: records.length,
                records,
            };
        }
        if (data.headcount !== undefined && data.headcount > 0) {
            const headcountBranchId = data.branchId || session.branchId;
            const headcountRecordedById = data.recordedById;
            const summaryRecord = await this.prisma.attendanceRecord.create({
                data: {
                    checkInTime: new Date(),
                    checkInMethod: 'MANUAL',
                    notes: `Headcount: ${data.headcount} attendees`,
                    session: {
                        connect: {
                            id: data.sessionId,
                        },
                    },
                    branch: headcountBranchId
                        ? { connect: { id: headcountBranchId } }
                        : undefined,
                    recordedBy: headcountRecordedById
                        ? { connect: { id: headcountRecordedById } }
                        : undefined,
                },
                include: {
                    session: true,
                    branch: true,
                    recordedBy: true,
                    member: true,
                },
            });
            return {
                success: true,
                count: data.headcount,
                records: [summaryRecord],
            };
        }
        throw new common_1.BadRequestException('Either attendanceRecords or headcount must be provided');
    }
    async checkOut(data) {
        const record = await this.prisma.attendanceRecord.findUnique({
            where: { id: data.recordId },
        });
        if (!record) {
            throw new common_1.NotFoundException(`Attendance record with ID ${data.recordId} not found`);
        }
        return this.prisma.attendanceRecord.update({
            where: { id: data.recordId },
            data: {
                checkOutTime: data.checkOutTime || new Date(),
            },
            include: {
                member: true,
                session: true,
                recordedBy: true,
                branch: true,
            },
        });
    }
    async findAttendanceRecords(sessionId, filter) {
        const session = await this.prisma.attendanceSession.findUnique({
            where: { id: sessionId },
        });
        if (!session) {
            throw new common_1.NotFoundException(`Attendance session with ID ${sessionId} not found`);
        }
        const where = {
            sessionId,
        };
        if (filter) {
            if (filter.memberId) {
                where.memberId = filter.memberId;
            }
            if (filter.checkInMethod) {
                where.checkInMethod = filter.checkInMethod;
            }
            if (filter.branchId) {
                where.branchId = filter.branchId;
            }
            if (filter.visitorNameContains) {
                where.visitorName = {
                    contains: filter.visitorNameContains,
                    mode: 'insensitive',
                };
            }
            if (filter.startDate || filter.endDate) {
                where.checkInTime = {};
                if (filter.startDate) {
                    where.checkInTime.gte = filter.startDate;
                }
                if (filter.endDate) {
                    where.checkInTime.lte = filter.endDate;
                }
            }
        }
        return this.prisma.attendanceRecord.findMany({
            where,
            include: {
                member: true,
                session: true,
                recordedBy: true,
                branch: true,
            },
            orderBy: {
                checkInTime: 'desc',
            },
        });
    }
    async findMemberAttendanceHistory(memberId) {
        const member = await this.prisma.member.findUnique({
            where: { id: memberId },
        });
        if (!member) {
            throw new common_1.NotFoundException(`Member with ID ${memberId} not found`);
        }
        return this.prisma.attendanceRecord.findMany({
            where: {
                memberId,
            },
            include: {
                session: true,
                member: true,
                recordedBy: true,
                branch: true,
            },
            orderBy: {
                checkInTime: 'desc',
            },
        });
    }
    async generateQRToken(data) {
        const session = await this.prisma.attendanceSession.findUnique({
            where: { id: data.sessionId },
        });
        if (!session) {
            throw new common_1.NotFoundException(`Attendance session with ID ${data.sessionId} not found`);
        }
        const token = (0, crypto_1.randomBytes)(16).toString('hex');
        const expiresInMinutes = data.expiresInMinutes || 60;
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + expiresInMinutes);
        return this.prisma.qRCodeToken.create({
            data: {
                token,
                session: {
                    connect: {
                        id: data.sessionId,
                    },
                },
                expiresAt,
            },
        });
    }
    async validateQRToken(token) {
        const qrToken = await this.prisma.qRCodeToken.findUnique({
            where: { token },
            include: {
                session: true,
            },
        });
        if (!qrToken) {
            throw new common_1.NotFoundException('Invalid QR code token');
        }
        if (qrToken.expiresAt < new Date()) {
            throw new common_1.BadRequestException('QR code token has expired');
        }
        return qrToken.session;
    }
    async processCardScan(data) {
        const session = await this.prisma.attendanceSession.findUnique({
            where: { id: data.sessionId },
        });
        if (!session) {
            throw new common_1.NotFoundException(`Attendance session with ID ${data.sessionId} not found`);
        }
        const member = await this.prisma.member.findFirst({
            where: { rfidCardId: data.cardId },
        });
        if (!member) {
            throw new common_1.NotFoundException(`No member found with card ID ${data.cardId}`);
        }
        const existingRecord = await this.prisma.attendanceRecord.findFirst({
            where: {
                sessionId: data.sessionId,
                memberId: member.id,
            },
        });
        if (existingRecord) {
            if (!existingRecord.checkOutTime) {
                return this.prisma.attendanceRecord.update({
                    where: { id: existingRecord.id },
                    data: {
                        checkOutTime: data.scanTime || new Date(),
                        updatedAt: new Date(),
                    },
                    include: {
                        member: true,
                        session: true,
                        recordedBy: true,
                        branch: true,
                    },
                });
            }
            else {
                throw new common_1.BadRequestException(`Member ${member.firstName} ${member.lastName} has already checked in and out for this session`);
            }
        }
        return this.prisma.attendanceRecord.create({
            data: {
                checkInTime: data.scanTime || new Date(),
                checkInMethod: data.scanMethod,
                notes: data.notes,
                session: {
                    connect: {
                        id: data.sessionId,
                    },
                },
                member: {
                    connect: {
                        id: member.id,
                    },
                },
                branch: data.branchId
                    ? { connect: { id: data.branchId } }
                    : session.branchId
                        ? { connect: { id: session.branchId } }
                        : undefined,
                recordedBy: data.recordedById
                    ? { connect: { id: data.recordedById } }
                    : undefined,
            },
            include: {
                member: true,
                session: true,
                recordedBy: true,
                branch: true,
            },
        });
    }
};
exports.AttendanceService = AttendanceService;
exports.AttendanceService = AttendanceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AttendanceService);
//# sourceMappingURL=attendance.service.js.map