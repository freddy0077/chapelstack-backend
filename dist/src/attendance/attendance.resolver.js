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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const attendance_service_1 = require("./attendance.service");
const attendance_alerts_service_1 = require("./attendance-alerts.service");
const attendance_stats_service_1 = require("./attendance-stats.service");
const attendance_session_entity_1 = require("./entities/attendance-session.entity");
const attendance_record_entity_1 = require("./entities/attendance-record.entity");
const qr_code_token_entity_1 = require("./entities/qr-code-token.entity");
const attendance_stats_entity_1 = require("./entities/attendance-stats.entity");
const absence_alert_entity_1 = require("./entities/absence-alert.entity");
const create_attendance_session_input_1 = require("./dto/create-attendance-session.input");
const update_attendance_session_input_1 = require("./dto/update-attendance-session.input");
const record_attendance_input_1 = require("./dto/record-attendance.input");
const record_bulk_attendance_input_1 = require("./dto/record-bulk-attendance.input");
const check_out_input_1 = require("./dto/check-out.input");
const attendance_filter_input_1 = require("./dto/attendance-filter.input");
const generate_qr_token_input_1 = require("./dto/generate-qr-token.input");
const attendance_stats_input_1 = require("./dto/attendance-stats.input");
const absence_alert_config_input_1 = require("./dto/absence-alert-config.input");
const card_scan_input_1 = require("./dto/card-scan.input");
const common_1 = require("@nestjs/common");
const common_2 = require("@nestjs/common");
let AttendanceResolver = class AttendanceResolver {
    attendanceService;
    attendanceAlertsService;
    attendanceStatsService;
    constructor(attendanceService, attendanceAlertsService, attendanceStatsService) {
        this.attendanceService = attendanceService;
        this.attendanceAlertsService = attendanceAlertsService;
        this.attendanceStatsService = attendanceStatsService;
    }
    async createAttendanceSession(createAttendanceSessionInput) {
        return this.attendanceService.createAttendanceSession(createAttendanceSessionInput);
    }
    async findAllAttendanceSessions(organisationId, branchId) {
        return this.attendanceService.findAllAttendanceSessions({
            branchId,
            organisationId,
        });
    }
    async findAttendanceSessionById(id) {
        return this.attendanceService.findAttendanceSessionById(id);
    }
    async updateAttendanceSession(updateAttendanceSessionInput) {
        return this.attendanceService.updateAttendanceSession(updateAttendanceSessionInput);
    }
    async deleteAttendanceSession(id) {
        return this.attendanceService.deleteAttendanceSession(id);
    }
    async recordAttendance(recordAttendanceInput) {
        return this.attendanceService.recordAttendance(recordAttendanceInput);
    }
    async recordBulkAttendance(recordBulkAttendanceInput) {
        const result = await this.attendanceService.recordBulkAttendance(recordBulkAttendanceInput);
        return result.success;
    }
    async checkOut(checkOutInput) {
        return this.attendanceService.checkOut(checkOutInput);
    }
    async findAttendanceRecords(sessionId, filter) {
        return this.attendanceService.findAttendanceRecords(sessionId, filter);
    }
    async findMemberAttendanceHistory(memberId) {
        return this.attendanceService.findMemberAttendanceHistory(memberId);
    }
    async generateQRToken(generateQRTokenInput) {
        return this.attendanceService.generateQRToken(generateQRTokenInput);
    }
    async processCardScan(input) {
        const result = await this.attendanceService.processCardScan(input);
        return result;
    }
    async validateQRToken(token) {
        return this.attendanceService.validateQRToken(token);
    }
    async getAttendanceStats(input) {
        if (!input.startDate || !input.endDate) {
            throw new common_2.BadRequestException('startDate and endDate are required');
        }
        return this.attendanceStatsService.generateAttendanceStats(input);
    }
    async findAbsentMembers(input) {
        return this.attendanceAlertsService.findAbsentMembers(input);
    }
    async generateAbsenceAlerts(input) {
        return this.attendanceAlertsService.generateAbsenceAlerts(input);
    }
    async scheduleAbsenceCheck(input) {
        return this.attendanceAlertsService.scheduleAbsenceCheck(input);
    }
};
exports.AttendanceResolver = AttendanceResolver;
__decorate([
    (0, graphql_1.Mutation)(() => attendance_session_entity_1.AttendanceSession),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_attendance_session_input_1.CreateAttendanceSessionInput]),
    __metadata("design:returntype", Promise)
], AttendanceResolver.prototype, "createAttendanceSession", null);
__decorate([
    (0, graphql_1.Query)(() => [attendance_session_entity_1.AttendanceSession], { name: 'attendanceSessions' }),
    __param(0, (0, graphql_1.Args)('organisationId', { type: () => graphql_1.ID, nullable: true })),
    __param(1, (0, graphql_1.Args)('branchId', { type: () => graphql_1.ID, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AttendanceResolver.prototype, "findAllAttendanceSessions", null);
__decorate([
    (0, graphql_1.Query)(() => attendance_session_entity_1.AttendanceSession, { name: 'attendanceSession' }),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID }, common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AttendanceResolver.prototype, "findAttendanceSessionById", null);
__decorate([
    (0, graphql_1.Mutation)(() => attendance_session_entity_1.AttendanceSession),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_attendance_session_input_1.UpdateAttendanceSessionInput]),
    __metadata("design:returntype", Promise)
], AttendanceResolver.prototype, "updateAttendanceSession", null);
__decorate([
    (0, graphql_1.Mutation)(() => attendance_session_entity_1.AttendanceSession),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID }, common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AttendanceResolver.prototype, "deleteAttendanceSession", null);
__decorate([
    (0, graphql_1.Mutation)(() => attendance_record_entity_1.AttendanceRecord),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [record_attendance_input_1.RecordAttendanceInput]),
    __metadata("design:returntype", Promise)
], AttendanceResolver.prototype, "recordAttendance", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [record_bulk_attendance_input_1.RecordBulkAttendanceInput]),
    __metadata("design:returntype", Promise)
], AttendanceResolver.prototype, "recordBulkAttendance", null);
__decorate([
    (0, graphql_1.Mutation)(() => attendance_record_entity_1.AttendanceRecord),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [check_out_input_1.CheckOutInput]),
    __metadata("design:returntype", Promise)
], AttendanceResolver.prototype, "checkOut", null);
__decorate([
    (0, graphql_1.Query)(() => [attendance_record_entity_1.AttendanceRecord], { name: 'attendanceRecords' }),
    __param(0, (0, graphql_1.Args)('sessionId', { type: () => graphql_1.ID }, common_1.ParseUUIDPipe)),
    __param(1, (0, graphql_1.Args)('filter', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, attendance_filter_input_1.AttendanceFilterInput]),
    __metadata("design:returntype", Promise)
], AttendanceResolver.prototype, "findAttendanceRecords", null);
__decorate([
    (0, graphql_1.Query)(() => [attendance_record_entity_1.AttendanceRecord], { name: 'memberAttendanceHistory' }),
    __param(0, (0, graphql_1.Args)('memberId', { type: () => graphql_1.ID }, common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AttendanceResolver.prototype, "findMemberAttendanceHistory", null);
__decorate([
    (0, graphql_1.Mutation)(() => qr_code_token_entity_1.QRCodeToken),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [generate_qr_token_input_1.GenerateQRTokenInput]),
    __metadata("design:returntype", Promise)
], AttendanceResolver.prototype, "generateQRToken", null);
__decorate([
    (0, graphql_1.Mutation)(() => attendance_record_entity_1.AttendanceRecord),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [card_scan_input_1.CardScanInput]),
    __metadata("design:returntype", Promise)
], AttendanceResolver.prototype, "processCardScan", null);
__decorate([
    (0, graphql_1.Query)(() => attendance_session_entity_1.AttendanceSession, { name: 'validateQRToken' }),
    __param(0, (0, graphql_1.Args)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AttendanceResolver.prototype, "validateQRToken", null);
__decorate([
    (0, graphql_1.Query)(() => attendance_stats_entity_1.AttendanceStats, { name: 'attendanceStats' }),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [attendance_stats_input_1.AttendanceStatsInput]),
    __metadata("design:returntype", Promise)
], AttendanceResolver.prototype, "getAttendanceStats", null);
__decorate([
    (0, graphql_1.Query)(() => absence_alert_entity_1.AbsenceAlertResult, { name: 'findAbsentMembers' }),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [absence_alert_config_input_1.AbsenceAlertConfigInput]),
    __metadata("design:returntype", Promise)
], AttendanceResolver.prototype, "findAbsentMembers", null);
__decorate([
    (0, graphql_1.Mutation)(() => absence_alert_entity_1.AbsenceAlertResult),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [absence_alert_config_input_1.AbsenceAlertConfigInput]),
    __metadata("design:returntype", Promise)
], AttendanceResolver.prototype, "generateAbsenceAlerts", null);
__decorate([
    (0, graphql_1.Mutation)(() => absence_alert_entity_1.AbsenceAlertResult),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [absence_alert_config_input_1.AbsenceAlertConfigInput]),
    __metadata("design:returntype", Promise)
], AttendanceResolver.prototype, "scheduleAbsenceCheck", null);
exports.AttendanceResolver = AttendanceResolver = __decorate([
    (0, graphql_1.Resolver)(() => attendance_session_entity_1.AttendanceSession),
    __metadata("design:paramtypes", [attendance_service_1.AttendanceService,
        attendance_alerts_service_1.AttendanceAlertsService,
        attendance_stats_service_1.AttendanceStatsService])
], AttendanceResolver);
//# sourceMappingURL=attendance.resolver.js.map