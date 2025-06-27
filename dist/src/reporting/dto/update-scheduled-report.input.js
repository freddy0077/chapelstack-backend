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
exports.UpdateScheduledReportInput = void 0;
const graphql_1 = require("@nestjs/graphql");
const create_scheduled_report_input_1 = require("./create-scheduled-report.input");
const class_validator_1 = require("class-validator");
let UpdateScheduledReportInput = class UpdateScheduledReportInput extends (0, graphql_1.PartialType)(create_scheduled_report_input_1.CreateScheduledReportInput) {
    id;
};
exports.UpdateScheduledReportInput = UpdateScheduledReportInput;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UpdateScheduledReportInput.prototype, "id", void 0);
exports.UpdateScheduledReportInput = UpdateScheduledReportInput = __decorate([
    (0, graphql_1.InputType)()
], UpdateScheduledReportInput);
//# sourceMappingURL=update-scheduled-report.input.js.map