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
exports.AttendanceReportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let AttendanceReportsService = class AttendanceReportsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAttendanceSummaryReport(filter) {
        const { branchId, organisationId, dateRange, eventTypeId } = filter;
        const where = {};
        if (branchId) {
            where.branchId = branchId;
        }
        if (organisationId) {
            where.organisationId = organisationId;
        }
        if (dateRange) {
            where.checkInTime = {
                gte: dateRange.startDate,
                lte: dateRange.endDate,
            };
        }
        const attendanceRecords = await this.prisma.attendanceRecord.findMany({
            where,
            include: {
                session: {
                    select: {
                        name: true,
                        type: true,
                    },
                },
            },
            orderBy: {
                checkInTime: 'asc',
            },
        });
        let branchName = '';
        if (branchId && attendanceRecords.length > 0) {
            const branch = await this.prisma.branch.findUnique({
                where: { id: branchId },
                select: { name: true },
            });
            branchName = branch?.name || '';
        }
        const sessionTypeSummary = {};
        let totalAttendance = 0;
        attendanceRecords.forEach((record) => {
            const sessionType = record.session?.type || 'Unknown';
            if (!sessionTypeSummary[sessionType]) {
                sessionTypeSummary[sessionType] = {
                    count: 0,
                    events: {},
                };
            }
            const sessionName = record.session?.name || 'Unknown';
            if (!sessionTypeSummary[sessionType].events[sessionName]) {
                sessionTypeSummary[sessionType].events[sessionName] = 0;
            }
            const attendanceCount = 1;
            sessionTypeSummary[sessionType].count += attendanceCount;
            sessionTypeSummary[sessionType].events[sessionName] += attendanceCount;
            totalAttendance += attendanceCount;
        });
        const eventTypes = Object.entries(sessionTypeSummary).map(([name, data]) => ({
            name,
            count: data.count,
            percentage: totalAttendance > 0 ? (data.count / totalAttendance) * 100 : 0,
            events: Object.entries(data.events).map(([eventName, count]) => ({
                name: eventName,
                count,
                percentage: data.count > 0 ? (count / data.count) * 100 : 0,
            })),
        }));
        return {
            totalAttendance,
            eventTypes,
            dateRange: {
                startDate: dateRange?.startDate,
                endDate: dateRange?.endDate,
            },
            branchId,
            organisationId,
            branchName,
        };
    }
    async getAttendanceTrendReport(branchId, organisationId, eventTypeId, dateRange) {
        const where = {};
        if (branchId) {
            where.branchId = branchId;
        }
        if (organisationId) {
            where.organisationId = organisationId;
        }
        const startDate = dateRange?.startDate ||
            new Date(new Date().setMonth(new Date().getMonth() - 6));
        const endDate = dateRange?.endDate || new Date();
        where.checkInTime = {
            gte: startDate,
            lte: endDate,
        };
        const branch = branchId
            ? await this.prisma.branch.findUnique({
                where: { id: branchId },
                select: { name: true },
            })
            : null;
        const attendanceRecords = await this.prisma.attendanceRecord.findMany({
            where,
            select: {
                checkInTime: true,
            },
            orderBy: {
                checkInTime: 'asc',
            },
        });
        const isLongPeriod = endDate.getTime() - startDate.getTime() > 90 * 24 * 60 * 60 * 1000;
        const groupedData = {};
        attendanceRecords.forEach((record) => {
            let key;
            if (isLongPeriod) {
                key = `${record.checkInTime.getFullYear()}-${record.checkInTime.getMonth() + 1}`;
            }
            else {
                const weekNumber = Math.floor((record.checkInTime.getTime() - startDate.getTime()) /
                    (7 * 24 * 60 * 60 * 1000));
                key = `week-${weekNumber}`;
            }
            if (!groupedData[key]) {
                groupedData[key] = {
                    date: new Date(record.checkInTime),
                    count: 0,
                };
            }
            groupedData[key].count += 1;
        });
        const trendData = Object.values(groupedData).map((data, index, array) => {
            const previousData = index > 0 ? array[index - 1] : { count: 0 };
            const percentChange = previousData.count > 0
                ? ((data.count - previousData.count) / previousData.count) * 100
                : undefined;
            return {
                date: data.date,
                count: data.count,
                percentChange,
            };
        });
        const totalAttendance = trendData.reduce((sum, data) => sum + data.count, 0);
        const averageAttendance = trendData.length > 0 ? totalAttendance / trendData.length : 0;
        let percentChangeFromPreviousPeriod = undefined;
        if (trendData.length > 1) {
            const currentPeriodTotal = trendData
                .slice(Math.floor(trendData.length / 2))
                .reduce((sum, data) => sum + Number(data.count), 0);
            const previousPeriodTotal = trendData
                .slice(0, Math.floor(trendData.length / 2))
                .reduce((sum, data) => sum + Number(data.count), 0);
            if (previousPeriodTotal > 0) {
                percentChangeFromPreviousPeriod =
                    ((currentPeriodTotal - previousPeriodTotal) / previousPeriodTotal) *
                        100;
            }
        }
        let eventTypeName = '';
        if (eventTypeId) {
            const sessionType = await this.prisma.attendanceSession.findFirst({
                where: { id: eventTypeId },
                select: { type: true },
            });
            eventTypeName = sessionType?.type || '';
        }
        return {
            branchId,
            organisationId,
            branchName: branch?.name,
            eventTypeId,
            eventTypeName,
            startDate,
            endDate,
            totalAttendance,
            averageAttendance,
            percentChangeFromPreviousPeriod,
            trendData,
        };
    }
};
exports.AttendanceReportsService = AttendanceReportsService;
exports.AttendanceReportsService = AttendanceReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AttendanceReportsService);
//# sourceMappingURL=attendance-reports.service.js.map