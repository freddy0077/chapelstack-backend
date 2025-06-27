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
exports.AttendanceStatsInput = exports.AttendanceStatsType = exports.AttendanceStatsPeriod = void 0;
const graphql_1 = require("@nestjs/graphql");
const class_validator_1 = require("class-validator");
var AttendanceStatsPeriod;
(function (AttendanceStatsPeriod) {
    AttendanceStatsPeriod["DAILY"] = "DAILY";
    AttendanceStatsPeriod["WEEKLY"] = "WEEKLY";
    AttendanceStatsPeriod["MONTHLY"] = "MONTHLY";
    AttendanceStatsPeriod["QUARTERLY"] = "QUARTERLY";
    AttendanceStatsPeriod["YEARLY"] = "YEARLY";
})(AttendanceStatsPeriod || (exports.AttendanceStatsPeriod = AttendanceStatsPeriod = {}));
(0, graphql_1.registerEnumType)(AttendanceStatsPeriod, {
    name: 'AttendanceStatsPeriod',
});
var AttendanceStatsType;
(function (AttendanceStatsType) {
    AttendanceStatsType["TOTAL_ATTENDANCE"] = "TOTAL_ATTENDANCE";
    AttendanceStatsType["UNIQUE_MEMBERS"] = "UNIQUE_MEMBERS";
    AttendanceStatsType["VISITORS"] = "VISITORS";
    AttendanceStatsType["FIRST_TIME_VISITORS"] = "FIRST_TIME_VISITORS";
    AttendanceStatsType["GROWTH_RATE"] = "GROWTH_RATE";
    AttendanceStatsType["RETENTION_RATE"] = "RETENTION_RATE";
})(AttendanceStatsType || (exports.AttendanceStatsType = AttendanceStatsType = {}));
(0, graphql_1.registerEnumType)(AttendanceStatsType, {
    name: 'AttendanceStatsType',
});
let AttendanceStatsInput = class AttendanceStatsInput {
    branchId;
    organisationId;
    sessionTypeId;
    startDate;
    endDate;
    period;
    statsTypes;
};
exports.AttendanceStatsInput = AttendanceStatsInput;
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], AttendanceStatsInput.prototype, "branchId", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], AttendanceStatsInput.prototype, "organisationId", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], AttendanceStatsInput.prototype, "sessionTypeId", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    (0, class_validator_1.IsISO8601)(),
    __metadata("design:type", String)
], AttendanceStatsInput.prototype, "startDate", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    (0, class_validator_1.IsISO8601)(),
    __metadata("design:type", String)
], AttendanceStatsInput.prototype, "endDate", void 0);
__decorate([
    (0, graphql_1.Field)(() => AttendanceStatsPeriod, {
        defaultValue: AttendanceStatsPeriod.WEEKLY,
    }),
    (0, class_validator_1.IsEnum)(AttendanceStatsPeriod),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AttendanceStatsInput.prototype, "period", void 0);
__decorate([
    (0, graphql_1.Field)(() => [AttendanceStatsType], {
        defaultValue: [AttendanceStatsType.TOTAL_ATTENDANCE],
    }),
    (0, class_validator_1.IsEnum)(AttendanceStatsType, { each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], AttendanceStatsInput.prototype, "statsTypes", void 0);
exports.AttendanceStatsInput = AttendanceStatsInput = __decorate([
    (0, graphql_1.InputType)()
], AttendanceStatsInput);
//# sourceMappingURL=attendance-stats.input.js.map