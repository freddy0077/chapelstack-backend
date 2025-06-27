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
var AttendanceStatsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceStatsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const attendance_stats_input_1 = require("./dto/attendance-stats.input");
let AttendanceStatsService = AttendanceStatsService_1 = class AttendanceStatsService {
    prisma;
    logger = new common_1.Logger(AttendanceStatsService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async generateAttendanceStats(input) {
        const { branchId, organisationId, startDate, endDate, period, statsTypes } = input;
        const groupByPeriod = period || attendance_stats_input_1.AttendanceStatsPeriod.WEEKLY;
        const typesToGenerate = statsTypes?.length
            ? statsTypes
            : [attendance_stats_input_1.AttendanceStatsType.TOTAL_ATTENDANCE];
        const results = {};
        for (const statType of typesToGenerate) {
            switch (statType) {
                case attendance_stats_input_1.AttendanceStatsType.TOTAL_ATTENDANCE:
                    results[statType] = await this.getTotalAttendance(startDate, endDate, groupByPeriod, branchId, organisationId, input.sessionTypeId);
                    break;
                case attendance_stats_input_1.AttendanceStatsType.UNIQUE_MEMBERS:
                    results[statType] = await this.getUniqueMembers(startDate, endDate, groupByPeriod, branchId, organisationId, input.sessionTypeId);
                    break;
                case attendance_stats_input_1.AttendanceStatsType.VISITORS:
                    results[statType] = await this.getVisitors(startDate, endDate, groupByPeriod, branchId, organisationId, input.sessionTypeId);
                    break;
                case attendance_stats_input_1.AttendanceStatsType.FIRST_TIME_VISITORS:
                    results[statType] = await this.getFirstTimeVisitors(startDate, endDate, groupByPeriod, branchId, organisationId);
                    break;
                case attendance_stats_input_1.AttendanceStatsType.GROWTH_RATE:
                    results[statType] = await this.getGrowthRate(startDate, endDate, groupByPeriod, branchId, organisationId, input.sessionTypeId);
                    break;
                case attendance_stats_input_1.AttendanceStatsType.RETENTION_RATE:
                    results[statType] = await this.getRetentionRate(startDate, endDate, groupByPeriod, branchId, organisationId);
                    break;
            }
        }
        results['BY_AGE_GROUP'] = await this.getAttendanceByAgeGroup(startDate, endDate, branchId, organisationId);
        results['BY_GENDER'] = await this.getAttendanceByGender(startDate, endDate, branchId, organisationId);
        results['BY_BRANCH'] = await this.getAttendanceByBranch(startDate, endDate, organisationId);
        results['BY_EVENT_TYPE'] = await this.getAttendanceByEventType(startDate, endDate, branchId, organisationId);
        results['FREQUENCY'] = await this.getAttendanceFrequency(startDate, endDate, branchId, organisationId);
        return {
            ...results,
            branchId,
            organisationId,
            startDate,
            endDate,
            period: groupByPeriod,
        };
    }
    async getTotalAttendance(startDate, endDate, period, branchId, organisationId, sessionTypeId) {
        const dateFormat = this.getDateFormatForPeriod(period);
        const params = [dateFormat, startDate, endDate];
        let filterClause = '1=1';
        let sessionTypeClause = '';
        if (organisationId) {
            filterClause = `ats."organisationId" = $${params.length + 1}`;
            params.push(organisationId);
        }
        else if (branchId) {
            filterClause = `ats."branchId" = $${params.length + 1}`;
            params.push(branchId);
        }
        if (sessionTypeId) {
            sessionTypeClause = `AND ats."type" = $${params.length + 1}`;
            params.push(sessionTypeId);
        }
        const sql = `
  SELECT 
    TO_CHAR(ats.date, $1) as period,
    COUNT(ar.id) as total
  FROM "AttendanceSession" ats
  LEFT JOIN "AttendanceRecord" ar ON ats.id = ar."sessionId"
  WHERE ${filterClause}
    AND ats.date BETWEEN $2::timestamp AND $3::timestamp
    ${sessionTypeClause}
  GROUP BY period
  ORDER BY MIN(ats.date)
`;
        const stats = await this.prisma.$queryRawUnsafe(sql, ...params);
        return stats.map((row) => ({
            period: row.period,
            total: row.total !== undefined && row.total !== null ? Number(row.total) : 0,
        }));
    }
    async getUniqueMembers(startDate, endDate, period, branchId, organisationId, sessionTypeId) {
        const dateFormat = this.getDateFormatForPeriod(period);
        const params = [dateFormat, startDate, endDate];
        let filterClause = '1=1';
        let sessionTypeClause = '';
        if (organisationId) {
            filterClause = `ats."organisationId" = $${params.length + 1}`;
            params.push(organisationId);
        }
        else if (branchId) {
            filterClause = `ats."branchId" = $${params.length + 1}`;
            params.push(branchId);
        }
        if (sessionTypeId) {
            sessionTypeClause = `AND ats."type" = $${params.length + 1}`;
            params.push(sessionTypeId);
        }
        const sql = `
  SELECT 
    TO_CHAR(ats.date, $1) as period,
    COUNT(DISTINCT ar."memberId") as unique_members
  FROM "AttendanceSession" ats
  LEFT JOIN "AttendanceRecord" ar ON ats.id = ar."sessionId"
  WHERE ${filterClause}
    AND ats.date BETWEEN $2::timestamp AND $3::timestamp
    AND ar."memberId" IS NOT NULL
    ${sessionTypeClause}
  GROUP BY period
  ORDER BY MIN(ats.date)
`;
        const stats = await this.prisma.$queryRawUnsafe(sql, ...params);
        return stats.map((row) => ({
            period: row.period,
            unique_members: row.unique_members !== undefined && row.unique_members !== null
                ? Number(row.unique_members)
                : 0,
        }));
    }
    async getVisitors(startDate, endDate, period, branchId, organisationId, sessionTypeId) {
        const dateFormat = this.getDateFormatForPeriod(period);
        const params = [dateFormat, startDate, endDate];
        let filterClause = '1=1';
        let sessionTypeClause = '';
        if (organisationId) {
            filterClause = `ats."organisationId" = $${params.length + 1}`;
            params.push(organisationId);
        }
        else if (branchId) {
            filterClause = `ats."branchId" = $${params.length + 1}`;
            params.push(branchId);
        }
        if (sessionTypeId) {
            sessionTypeClause = `AND ats."type" = $${params.length + 1}`;
            params.push(sessionTypeId);
        }
        const sql = `
  SELECT 
    TO_CHAR(ats.date, $1) as period,
    COUNT(ar.id) as visitors
  FROM "AttendanceSession" ats
  LEFT JOIN "AttendanceRecord" ar ON ats.id = ar."sessionId"
  WHERE ${filterClause}
    AND ats.date BETWEEN $2::timestamp AND $3::timestamp
    AND ar."memberId" IS NULL
    AND ar."visitorName" IS NOT NULL
    ${sessionTypeClause}
  GROUP BY period
  ORDER BY MIN(ats.date)
`;
        const stats = await this.prisma.$queryRawUnsafe(sql, ...params);
        return stats.map((row) => ({
            period: row.period,
            visitors: row.visitors !== undefined && row.visitors !== null
                ? Number(row.visitors)
                : 0,
        }));
    }
    async getFirstTimeVisitors(startDate, endDate, period, branchId, organisationId) {
        this.logger.log(`Getting first-time visitors for ${organisationId ? `organisation ${organisationId}` : `branch ${branchId}`} from ${startDate} to ${endDate} by ${period}`);
        await new Promise((resolve) => setTimeout(resolve, 10));
        return [{ period: 'Placeholder', first_time_visitors: 0 }];
    }
    async getGrowthRate(startDate, endDate, period, branchId, organisationId, sessionTypeId) {
        this.logger.log(`Calculating growth rate for ${organisationId ? `organisation ${organisationId}` : `branch ${branchId}`} from ${startDate} to ${endDate} by ${period}`);
        if (sessionTypeId) {
            this.logger.log(`Filtering by session type: ${sessionTypeId}`);
        }
        await new Promise((resolve) => setTimeout(resolve, 10));
        return [{ period: 'Placeholder', growth_rate: 0 }];
    }
    async getRetentionRate(startDate, endDate, period, branchId, organisationId) {
        this.logger.log(`Calculating retention rate for ${organisationId ? `organisation ${organisationId}` : `branch ${branchId}`} from ${startDate} to ${endDate} by ${period}`);
        await new Promise((resolve) => setTimeout(resolve, 10));
        return [{ period: 'Placeholder', retention_rate: 0 }];
    }
    async getAttendanceByAgeGroup(startDate, endDate, branchId, organisationId) {
        const ageGroups = [
            { label: '<18', min: 0, max: 17 },
            { label: '18-25', min: 18, max: 25 },
            { label: '26-35', min: 26, max: 35 },
            { label: '36-50', min: 36, max: 50 },
            { label: '51-65', min: 51, max: 65 },
            { label: '65+', min: 66, max: 200 },
        ];
        const now = new Date();
        const stats = [];
        const where = {
            checkInTime: { gte: startDate, lte: endDate },
        };
        if (organisationId) {
            where.session = {
                organisationId: organisationId,
            };
        }
        else if (branchId) {
            where.session = {
                branchId: branchId,
            };
        }
        for (const group of ageGroups) {
            const minBirth = new Date(now.getFullYear() - group.max, now.getMonth(), now.getDate());
            const maxBirth = new Date(now.getFullYear() - group.min, now.getMonth(), now.getDate());
            const count = await this.prisma.attendanceRecord.count({
                where: {
                    ...where,
                    member: {
                        dateOfBirth: { gte: minBirth, lte: maxBirth },
                    },
                },
            });
            stats.push({ group: group.label, count });
        }
        return stats;
    }
    async getAttendanceByGender(startDate, endDate, branchId, organisationId) {
        const genders = ['Male', 'Female', 'Other'];
        const stats = [];
        const where = {
            checkInTime: { gte: startDate, lte: endDate },
        };
        if (organisationId) {
            where.session = {
                organisationId: organisationId,
            };
        }
        else if (branchId) {
            where.session = {
                branchId: branchId,
            };
        }
        for (const gender of genders) {
            const count = await this.prisma.attendanceRecord.count({
                where: {
                    ...where,
                    member: {
                        gender: gender,
                    },
                },
            });
            stats.push({ group: gender, count });
        }
        return stats;
    }
    async getAttendanceByBranch(startDate, endDate, organisationId) {
        const where = {
            checkInTime: { gte: startDate, lte: endDate },
            session: {
                organisationId: organisationId,
            },
        };
        const records = await this.prisma.attendanceRecord.findMany({
            where,
            include: {
                session: {
                    select: {
                        branch: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
        });
        const stats = {};
        for (const record of records) {
            const branchName = record.session?.branch?.name || 'Unknown';
            stats[branchName] = (stats[branchName] || 0) + 1;
        }
        return Object.entries(stats).map(([group, count]) => ({ group, count }));
    }
    async getAttendanceByEventType(startDate, endDate, branchId, organisationId) {
        const where = {
            checkInTime: { gte: startDate, lte: endDate },
        };
        if (organisationId) {
            where.session = {
                organisationId: organisationId,
            };
        }
        else if (branchId) {
            where.session = {
                branchId: branchId,
            };
        }
        const records = await this.prisma.attendanceRecord.findMany({
            where,
            include: {
                session: {
                    select: {
                        type: true,
                    },
                },
            },
        });
        const stats = {};
        for (const record of records) {
            const eventType = record.session?.type || 'Unknown';
            stats[eventType] = (stats[eventType] || 0) + 1;
        }
        return Object.entries(stats).map(([eventType, count]) => ({
            eventType,
            count,
        }));
    }
    async getAttendanceFrequency(startDate, endDate, branchId, organisationId) {
        const where = {
            checkInTime: { gte: startDate, lte: endDate },
            memberId: { not: null },
        };
        if (organisationId) {
            where.session = {
                organisationId: organisationId,
            };
        }
        else if (branchId) {
            where.session = {
                branchId: branchId,
            };
        }
        const records = await this.prisma.attendanceRecord.groupBy({
            by: ['memberId'],
            _count: {
                id: true,
            },
            where,
        });
        const frequencyMap = {};
        for (const record of records) {
            const count = record._count.id;
            frequencyMap[count] = (frequencyMap[count] || 0) + 1;
        }
        return Object.entries(frequencyMap).map(([label, count]) => ({
            label: `${label} time(s)`,
            count,
        }));
    }
    getDateFormatForPeriod(period) {
        switch (period) {
            case attendance_stats_input_1.AttendanceStatsPeriod.DAILY:
                return 'YYYY-MM-DD';
            case attendance_stats_input_1.AttendanceStatsPeriod.WEEKLY:
                return 'IYYY-IW';
            case attendance_stats_input_1.AttendanceStatsPeriod.MONTHLY:
                return 'YYYY-MM';
            case attendance_stats_input_1.AttendanceStatsPeriod.QUARTERLY:
                return 'YYYY-"Q"Q';
            case attendance_stats_input_1.AttendanceStatsPeriod.YEARLY:
                return 'YYYY';
            default:
                return 'YYYY-MM-DD';
        }
    }
};
exports.AttendanceStatsService = AttendanceStatsService;
exports.AttendanceStatsService = AttendanceStatsService = AttendanceStatsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AttendanceStatsService);
//# sourceMappingURL=attendance-stats.service.js.map