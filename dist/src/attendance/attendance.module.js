"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceModule = void 0;
const common_1 = require("@nestjs/common");
const attendance_service_1 = require("./attendance.service");
const attendance_resolver_1 = require("./attendance.resolver");
const attendance_alerts_service_1 = require("./attendance-alerts.service");
const attendance_stats_service_1 = require("./attendance-stats.service");
const prisma_module_1 = require("../prisma/prisma.module");
let AttendanceModule = class AttendanceModule {
};
exports.AttendanceModule = AttendanceModule;
exports.AttendanceModule = AttendanceModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        providers: [
            attendance_resolver_1.AttendanceResolver,
            attendance_service_1.AttendanceService,
            attendance_alerts_service_1.AttendanceAlertsService,
            attendance_stats_service_1.AttendanceStatsService,
        ],
        exports: [attendance_service_1.AttendanceService, attendance_alerts_service_1.AttendanceAlertsService, attendance_stats_service_1.AttendanceStatsService],
    })
], AttendanceModule);
//# sourceMappingURL=attendance.module.js.map