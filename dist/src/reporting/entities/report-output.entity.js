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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportOutput = void 0;
const graphql_1 = require("@nestjs/graphql");
const graphql_type_json_1 = __importDefault(require("graphql-type-json"));
const report_filter_input_1 = require("../dto/report-filter.input");
(0, graphql_1.registerEnumType)(report_filter_input_1.OutputFormat, {
    name: 'OutputFormat',
    description: 'Available output formats for reports',
});
let ReportOutput = class ReportOutput {
    reportType;
    downloadUrl;
    message;
    generatedAt;
    format;
    data;
};
exports.ReportOutput = ReportOutput;
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], ReportOutput.prototype, "reportType", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], ReportOutput.prototype, "downloadUrl", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], ReportOutput.prototype, "message", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date),
    __metadata("design:type", Date)
], ReportOutput.prototype, "generatedAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => report_filter_input_1.OutputFormat),
    __metadata("design:type", String)
], ReportOutput.prototype, "format", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.default, { nullable: true }),
    __metadata("design:type", Object)
], ReportOutput.prototype, "data", void 0);
exports.ReportOutput = ReportOutput = __decorate([
    (0, graphql_1.ObjectType)()
], ReportOutput);
//# sourceMappingURL=report-output.entity.js.map