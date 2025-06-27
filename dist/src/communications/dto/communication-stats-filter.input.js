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
exports.CommunicationStatsFilterInput = void 0;
const graphql_1 = require("@nestjs/graphql");
const class_validator_1 = require("class-validator");
let CommunicationStatsFilterInput = class CommunicationStatsFilterInput {
    branchId;
    startDate;
    endDate;
    channels;
    statuses;
    groupBy;
};
exports.CommunicationStatsFilterInput = CommunicationStatsFilterInput;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CommunicationStatsFilterInput.prototype, "branchId", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CommunicationStatsFilterInput.prototype, "startDate", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CommunicationStatsFilterInput.prototype, "endDate", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CommunicationStatsFilterInput.prototype, "channels", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CommunicationStatsFilterInput.prototype, "statuses", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CommunicationStatsFilterInput.prototype, "groupBy", void 0);
exports.CommunicationStatsFilterInput = CommunicationStatsFilterInput = __decorate([
    (0, graphql_1.InputType)()
], CommunicationStatsFilterInput);
//# sourceMappingURL=communication-stats-filter.input.js.map