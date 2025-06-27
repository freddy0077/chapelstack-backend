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
exports.ScheduledReport = void 0;
const graphql_1 = require("@nestjs/graphql");
const graphql_2 = require("@nestjs/graphql");
const report_frequency_enum_1 = require("../enums/report-frequency.enum");
const report_filter_input_1 = require("../dto/report-filter.input");
let ScheduledReport = class ScheduledReport {
    id;
    name;
    reportType;
    frequency;
    lastRunAt;
    nextRunAt;
    recipientEmails;
    outputFormat;
    branchId;
    createdById;
    createdAt;
    updatedAt;
    isActive;
    filterJson;
};
exports.ScheduledReport = ScheduledReport;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], ScheduledReport.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], ScheduledReport.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], ScheduledReport.prototype, "reportType", void 0);
__decorate([
    (0, graphql_1.Field)(() => report_frequency_enum_1.ReportFrequency),
    __metadata("design:type", String)
], ScheduledReport.prototype, "frequency", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_2.GraphQLISODateTime, { nullable: true }),
    __metadata("design:type", Object)
], ScheduledReport.prototype, "lastRunAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_2.GraphQLISODateTime, { nullable: true }),
    __metadata("design:type", Object)
], ScheduledReport.prototype, "nextRunAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String]),
    __metadata("design:type", Array)
], ScheduledReport.prototype, "recipientEmails", void 0);
__decorate([
    (0, graphql_1.Field)(() => report_filter_input_1.OutputFormat),
    __metadata("design:type", String)
], ScheduledReport.prototype, "outputFormat", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Object)
], ScheduledReport.prototype, "branchId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], ScheduledReport.prototype, "createdById", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_2.GraphQLISODateTime),
    __metadata("design:type", Date)
], ScheduledReport.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_2.GraphQLISODateTime),
    __metadata("design:type", Date)
], ScheduledReport.prototype, "updatedAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], ScheduledReport.prototype, "isActive", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], ScheduledReport.prototype, "filterJson", void 0);
exports.ScheduledReport = ScheduledReport = __decorate([
    (0, graphql_1.ObjectType)()
], ScheduledReport);
//# sourceMappingURL=scheduled-report.entity.js.map