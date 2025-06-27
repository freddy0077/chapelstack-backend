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
exports.ReportRequestInput = exports.OutputFormat = exports.ReportFilterInput = exports.DateRangeInput = void 0;
const graphql_1 = require("@nestjs/graphql");
const class_validator_1 = require("class-validator");
let DateRangeInput = class DateRangeInput {
    startDate;
    endDate;
};
exports.DateRangeInput = DateRangeInput;
__decorate([
    (0, graphql_1.Field)(() => Date),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], DateRangeInput.prototype, "startDate", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], DateRangeInput.prototype, "endDate", void 0);
exports.DateRangeInput = DateRangeInput = __decorate([
    (0, graphql_1.InputType)()
], DateRangeInput);
let ReportFilterInput = class ReportFilterInput {
    branchId;
    organisationId;
    dateRange;
    groupId;
    eventTypeId;
    fundId;
    searchTerm;
};
exports.ReportFilterInput = ReportFilterInput;
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], ReportFilterInput.prototype, "branchId", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], ReportFilterInput.prototype, "organisationId", void 0);
__decorate([
    (0, graphql_1.Field)(() => DateRangeInput, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", DateRangeInput)
], ReportFilterInput.prototype, "dateRange", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], ReportFilterInput.prototype, "groupId", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], ReportFilterInput.prototype, "eventTypeId", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], ReportFilterInput.prototype, "fundId", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReportFilterInput.prototype, "searchTerm", void 0);
exports.ReportFilterInput = ReportFilterInput = __decorate([
    (0, graphql_1.InputType)()
], ReportFilterInput);
var OutputFormat;
(function (OutputFormat) {
    OutputFormat["JSON"] = "JSON";
    OutputFormat["CSV"] = "CSV";
    OutputFormat["PDF"] = "PDF";
    OutputFormat["EXCEL"] = "EXCEL";
})(OutputFormat || (exports.OutputFormat = OutputFormat = {}));
let ReportRequestInput = class ReportRequestInput {
    reportType;
    filter;
    outputFormat;
};
exports.ReportRequestInput = ReportRequestInput;
__decorate([
    (0, graphql_1.Field)(() => String),
    (0, class_validator_1.IsEnum)([
        'MEMBER_LIST',
        'ATTENDANCE_SUMMARY',
        'FINANCIAL_CONTRIBUTIONS',
        'MEMBER_DEMOGRAPHICS',
        'ATTENDANCE_TREND',
    ]),
    __metadata("design:type", String)
], ReportRequestInput.prototype, "reportType", void 0);
__decorate([
    (0, graphql_1.Field)(() => ReportFilterInput),
    __metadata("design:type", ReportFilterInput)
], ReportRequestInput.prototype, "filter", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(OutputFormat),
    __metadata("design:type", String)
], ReportRequestInput.prototype, "outputFormat", void 0);
exports.ReportRequestInput = ReportRequestInput = __decorate([
    (0, graphql_1.InputType)()
], ReportRequestInput);
//# sourceMappingURL=report-filter.input.js.map