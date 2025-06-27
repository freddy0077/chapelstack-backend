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
var AttendanceAlertsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceAlertsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AttendanceAlertsService = AttendanceAlertsService_1 = class AttendanceAlertsService {
    prisma;
    logger = new common_1.Logger(AttendanceAlertsService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAbsentMembers(config) {
        const { branchId, absenceThresholdDays } = config;
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - absenceThresholdDays);
        const absentMembers = await this.prisma.$queryRaw `
      SELECT m.id, m."firstName", m."lastName", m.email, m.phone, 
             MAX(ar."checkInTime") as "lastAttendance"
      FROM "Member" m
      LEFT JOIN "AttendanceRecord" ar ON m.id = ar."memberId"
      WHERE m."branchId" = ${branchId}
      AND m."isActive" = true
      GROUP BY m.id, m."firstName", m."lastName", m.email, m.phone
      HAVING MAX(ar."checkInTime") < ${cutoffDate} OR MAX(ar."checkInTime") IS NULL
      ORDER BY "lastAttendance" ASC NULLS FIRST
    `;
        return {
            success: true,
            count: absentMembers.length,
            members: absentMembers,
        };
    }
    async generateAbsenceAlerts(config) {
        const result = await this.findAbsentMembers(config);
        if (result.members.length === 0) {
            return { success: true, count: 0, members: [] };
        }
        const absentMembers = result.members;
        for (const member of absentMembers) {
            const lastAttendance = member.lastAttendance
                ? new Date(member.lastAttendance).toLocaleDateString()
                : 'Never';
            this.logger.log(`Absence alert for ${member.firstName} ${member.lastName} - Last attendance: ${lastAttendance}`);
            if (config.sendEmailAlerts && member.email) {
                this.logger.log(`Would send email to ${member.email}`);
            }
            if (config.sendSmsAlerts && member.phone) {
                this.logger.log(`Would send SMS to ${member.phone}`);
            }
        }
        return {
            success: true,
            count: absentMembers.length,
            members: absentMembers,
        };
    }
    async scheduleAbsenceCheck(config) {
        return this.generateAbsenceAlerts(config);
    }
};
exports.AttendanceAlertsService = AttendanceAlertsService;
exports.AttendanceAlertsService = AttendanceAlertsService = AttendanceAlertsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AttendanceAlertsService);
//# sourceMappingURL=attendance-alerts.service.js.map