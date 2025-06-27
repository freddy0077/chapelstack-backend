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
exports.CreateScheduledReportInput = void 0;
const graphql_1 = require("@nestjs/graphql");
const class_validator_1 = require("class-validator");
const report_frequency_enum_1 = require("../enums/report-frequency.enum");
const report_filter_input_1 = require("./report-filter.input");
let CreateScheduledReportInput = class CreateScheduledReportInput {
    name;
    reportType;
    frequency;
    recipientEmails;
    outputFormat;
    branchId;
    filterJson;
};
exports.CreateScheduledReportInput = CreateScheduledReportInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateScheduledReportInput.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateScheduledReportInput.prototype, "reportType", void 0);
__decorate([
    (0, graphql_1.Field)(() => report_frequency_enum_1.ReportFrequency),
    (0, class_validator_1.IsEnum)(report_frequency_enum_1.ReportFrequency),
    __metadata("design:type", String)
], CreateScheduledReportInput.prototype, "frequency", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String]),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsEmail)({}, { each: true }),
    __metadata("design:type", Array)
], CreateScheduledReportInput.prototype, "recipientEmails", void 0);
__decorate([
    (0, graphql_1.Field)(() => report_filter_input_1.OutputFormat),
    (0, class_validator_1.IsEnum)(report_filter_input_1.OutputFormat),
    __metadata("design:type", String)
], CreateScheduledReportInput.prototype, "outputFormat", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateScheduledReportInput.prototype, "branchId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateScheduledReportInput.prototype, "filterJson", void 0);
exports.CreateScheduledReportInput = CreateScheduledReportInput = __decorate([
    (0, graphql_1.InputType)()
], CreateScheduledReportInput);
//# sourceMappingURL=create-scheduled-report.input.js.map