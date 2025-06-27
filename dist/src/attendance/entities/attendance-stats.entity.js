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
exports.AttendanceStats = exports.AttendanceFrequencyStat = exports.AttendanceByEventStat = exports.AttendanceByDemographicsStat = exports.RetentionRateStat = exports.GrowthRateStat = exports.FirstTimeVisitorsStat = exports.VisitorsStat = exports.UniqueMembersStat = exports.TotalAttendanceStat = exports.PeriodStat = void 0;
const graphql_1 = require("@nestjs/graphql");
const class_validator_1 = require("class-validator");
const attendance_stats_input_1 = require("../dto/attendance-stats.input");
let PeriodStat = class PeriodStat {
    period;
    value;
};
exports.PeriodStat = PeriodStat;
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], PeriodStat.prototype, "period", void 0);
__decorate([
    (0, graphql_1.Field)(() => Number),
    __metadata("design:type", Number)
], PeriodStat.prototype, "value", void 0);
exports.PeriodStat = PeriodStat = __decorate([
    (0, graphql_1.ObjectType)()
], PeriodStat);
let TotalAttendanceStat = class TotalAttendanceStat {
    period;
    total;
};
exports.TotalAttendanceStat = TotalAttendanceStat;
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], TotalAttendanceStat.prototype, "period", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], TotalAttendanceStat.prototype, "total", void 0);
exports.TotalAttendanceStat = TotalAttendanceStat = __decorate([
    (0, graphql_1.ObjectType)()
], TotalAttendanceStat);
let UniqueMembersStat = class UniqueMembersStat {
    period;
    unique_members;
};
exports.UniqueMembersStat = UniqueMembersStat;
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], UniqueMembersStat.prototype, "period", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], UniqueMembersStat.prototype, "unique_members", void 0);
exports.UniqueMembersStat = UniqueMembersStat = __decorate([
    (0, graphql_1.ObjectType)()
], UniqueMembersStat);
let VisitorsStat = class VisitorsStat {
    period;
    visitors;
};
exports.VisitorsStat = VisitorsStat;
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], VisitorsStat.prototype, "period", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], VisitorsStat.prototype, "visitors", void 0);
exports.VisitorsStat = VisitorsStat = __decorate([
    (0, graphql_1.ObjectType)()
], VisitorsStat);
let FirstTimeVisitorsStat = class FirstTimeVisitorsStat {
    period;
    first_time_visitors;
};
exports.FirstTimeVisitorsStat = FirstTimeVisitorsStat;
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], FirstTimeVisitorsStat.prototype, "period", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], FirstTimeVisitorsStat.prototype, "first_time_visitors", void 0);
exports.FirstTimeVisitorsStat = FirstTimeVisitorsStat = __decorate([
    (0, graphql_1.ObjectType)()
], FirstTimeVisitorsStat);
let GrowthRateStat = class GrowthRateStat {
    period;
    growth_rate;
};
exports.GrowthRateStat = GrowthRateStat;
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], GrowthRateStat.prototype, "period", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], GrowthRateStat.prototype, "growth_rate", void 0);
exports.GrowthRateStat = GrowthRateStat = __decorate([
    (0, graphql_1.ObjectType)()
], GrowthRateStat);
let RetentionRateStat = class RetentionRateStat {
    period;
    retention_rate;
};
exports.RetentionRateStat = RetentionRateStat;
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], RetentionRateStat.prototype, "period", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], RetentionRateStat.prototype, "retention_rate", void 0);
exports.RetentionRateStat = RetentionRateStat = __decorate([
    (0, graphql_1.ObjectType)()
], RetentionRateStat);
let AttendanceByDemographicsStat = class AttendanceByDemographicsStat {
    group;
    count;
};
exports.AttendanceByDemographicsStat = AttendanceByDemographicsStat;
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], AttendanceByDemographicsStat.prototype, "group", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], AttendanceByDemographicsStat.prototype, "count", void 0);
exports.AttendanceByDemographicsStat = AttendanceByDemographicsStat = __decorate([
    (0, graphql_1.ObjectType)()
], AttendanceByDemographicsStat);
let AttendanceByEventStat = class AttendanceByEventStat {
    eventType;
    count;
};
exports.AttendanceByEventStat = AttendanceByEventStat;
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], AttendanceByEventStat.prototype, "eventType", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], AttendanceByEventStat.prototype, "count", void 0);
exports.AttendanceByEventStat = AttendanceByEventStat = __decorate([
    (0, graphql_1.ObjectType)()
], AttendanceByEventStat);
let AttendanceFrequencyStat = class AttendanceFrequencyStat {
    label;
    count;
};
exports.AttendanceFrequencyStat = AttendanceFrequencyStat;
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], AttendanceFrequencyStat.prototype, "label", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], AttendanceFrequencyStat.prototype, "count", void 0);
exports.AttendanceFrequencyStat = AttendanceFrequencyStat = __decorate([
    (0, graphql_1.ObjectType)()
], AttendanceFrequencyStat);
let AttendanceStats = class AttendanceStats {
    TOTAL_ATTENDANCE;
    UNIQUE_MEMBERS;
    VISITORS;
    FIRST_TIME_VISITORS;
    GROWTH_RATE;
    RETENTION_RATE;
    BY_AGE_GROUP;
    BY_GENDER;
    BY_BRANCH;
    BY_EVENT_TYPE;
    FREQUENCY;
    branchId;
    startDate;
    endDate;
    period;
};
exports.AttendanceStats = AttendanceStats;
__decorate([
    (0, graphql_1.Field)(() => [TotalAttendanceStat], { nullable: true }),
    __metadata("design:type", Array)
], AttendanceStats.prototype, "TOTAL_ATTENDANCE", void 0);
__decorate([
    (0, graphql_1.Field)(() => [UniqueMembersStat], { nullable: true }),
    __metadata("design:type", Array)
], AttendanceStats.prototype, "UNIQUE_MEMBERS", void 0);
__decorate([
    (0, graphql_1.Field)(() => [VisitorsStat], { nullable: true }),
    __metadata("design:type", Array)
], AttendanceStats.prototype, "VISITORS", void 0);
__decorate([
    (0, graphql_1.Field)(() => [FirstTimeVisitorsStat], { nullable: true }),
    __metadata("design:type", Array)
], AttendanceStats.prototype, "FIRST_TIME_VISITORS", void 0);
__decorate([
    (0, graphql_1.Field)(() => [GrowthRateStat], { nullable: true }),
    __metadata("design:type", Array)
], AttendanceStats.prototype, "GROWTH_RATE", void 0);
__decorate([
    (0, graphql_1.Field)(() => [RetentionRateStat], { nullable: true }),
    __metadata("design:type", Array)
], AttendanceStats.prototype, "RETENTION_RATE", void 0);
__decorate([
    (0, graphql_1.Field)(() => [AttendanceByDemographicsStat], { nullable: true }),
    __metadata("design:type", Array)
], AttendanceStats.prototype, "BY_AGE_GROUP", void 0);
__decorate([
    (0, graphql_1.Field)(() => [AttendanceByDemographicsStat], { nullable: true }),
    __metadata("design:type", Array)
], AttendanceStats.prototype, "BY_GENDER", void 0);
__decorate([
    (0, graphql_1.Field)(() => [AttendanceByDemographicsStat], { nullable: true }),
    __metadata("design:type", Array)
], AttendanceStats.prototype, "BY_BRANCH", void 0);
__decorate([
    (0, graphql_1.Field)(() => [AttendanceByEventStat], { nullable: true }),
    __metadata("design:type", Array)
], AttendanceStats.prototype, "BY_EVENT_TYPE", void 0);
__decorate([
    (0, graphql_1.Field)(() => [AttendanceFrequencyStat], { nullable: true }),
    __metadata("design:type", Array)
], AttendanceStats.prototype, "FREQUENCY", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], AttendanceStats.prototype, "branchId", void 0);
__decorate([
    (0, class_validator_1.IsISO8601)(),
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], AttendanceStats.prototype, "startDate", void 0);
__decorate([
    (0, class_validator_1.IsISO8601)(),
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], AttendanceStats.prototype, "endDate", void 0);
__decorate([
    (0, graphql_1.Field)(() => attendance_stats_input_1.AttendanceStatsPeriod),
    __metadata("design:type", String)
], AttendanceStats.prototype, "period", void 0);
exports.AttendanceStats = AttendanceStats = __decorate([
    (0, graphql_1.ObjectType)()
], AttendanceStats);
//# sourceMappingURL=attendance-stats.entity.js.map