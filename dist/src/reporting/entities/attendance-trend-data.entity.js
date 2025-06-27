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
exports.AttendanceTrendData = exports.AttendanceDataPoint = void 0;
const graphql_1 = require("@nestjs/graphql");
let AttendanceDataPoint = class AttendanceDataPoint {
    date;
    count;
    percentChange;
};
exports.AttendanceDataPoint = AttendanceDataPoint;
__decorate([
    (0, graphql_1.Field)(() => Date),
    __metadata("design:type", Date)
], AttendanceDataPoint.prototype, "date", void 0);
__decorate([
    (0, graphql_1.Field)(() => Number),
    __metadata("design:type", Number)
], AttendanceDataPoint.prototype, "count", void 0);
__decorate([
    (0, graphql_1.Field)(() => Number, { nullable: true }),
    __metadata("design:type", Number)
], AttendanceDataPoint.prototype, "percentChange", void 0);
exports.AttendanceDataPoint = AttendanceDataPoint = __decorate([
    (0, graphql_1.ObjectType)()
], AttendanceDataPoint);
let AttendanceTrendData = class AttendanceTrendData {
    branchId;
    organisationId;
    branchName;
    eventTypeId;
    eventTypeName;
    startDate;
    endDate;
    totalAttendance;
    averageAttendance;
    percentChangeFromPreviousPeriod;
    trendData;
};
exports.AttendanceTrendData = AttendanceTrendData;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID, { nullable: true }),
    __metadata("design:type", String)
], AttendanceTrendData.prototype, "branchId", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID, { nullable: true }),
    __metadata("design:type", String)
], AttendanceTrendData.prototype, "organisationId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AttendanceTrendData.prototype, "branchName", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], AttendanceTrendData.prototype, "eventTypeId", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], AttendanceTrendData.prototype, "eventTypeName", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date),
    __metadata("design:type", Date)
], AttendanceTrendData.prototype, "startDate", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date),
    __metadata("design:type", Date)
], AttendanceTrendData.prototype, "endDate", void 0);
__decorate([
    (0, graphql_1.Field)(() => Number),
    __metadata("design:type", Number)
], AttendanceTrendData.prototype, "totalAttendance", void 0);
__decorate([
    (0, graphql_1.Field)(() => Number),
    __metadata("design:type", Number)
], AttendanceTrendData.prototype, "averageAttendance", void 0);
__decorate([
    (0, graphql_1.Field)(() => Number, { nullable: true }),
    __metadata("design:type", Number)
], AttendanceTrendData.prototype, "percentChangeFromPreviousPeriod", void 0);
__decorate([
    (0, graphql_1.Field)(() => [AttendanceDataPoint]),
    __metadata("design:type", Array)
], AttendanceTrendData.prototype, "trendData", void 0);
exports.AttendanceTrendData = AttendanceTrendData = __decorate([
    (0, graphql_1.ObjectType)()
], AttendanceTrendData);
//# sourceMappingURL=attendance-trend-data.entity.js.map