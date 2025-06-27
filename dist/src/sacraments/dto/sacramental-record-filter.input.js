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
exports.SacramentalRecordFilterInput = void 0;
const graphql_1 = require("@nestjs/graphql");
const client_1 = require("@prisma/client");
const class_validator_1 = require("class-validator");
const sacramental_record_entity_1 = require("../entities/sacramental-record.entity");
const VALID_SACRAMENT_TYPES = Object.values(sacramental_record_entity_1.SacramentTypeEnum);
let SacramentalRecordFilterInput = class SacramentalRecordFilterInput {
    sacramentType;
    dateFrom;
    dateTo;
    branchId;
    organisationId;
    certificateNumber;
    officiantName;
    locationOfSacrament;
};
exports.SacramentalRecordFilterInput = SacramentalRecordFilterInput;
__decorate([
    (0, graphql_1.Field)(() => sacramental_record_entity_1.SacramentTypeEnum, { nullable: true }),
    (0, class_validator_1.IsIn)(VALID_SACRAMENT_TYPES, {
        message: 'sacramentType must be a valid SacramentType enum value',
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SacramentalRecordFilterInput.prototype, "sacramentType", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsDate)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], SacramentalRecordFilterInput.prototype, "dateFrom", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsDate)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], SacramentalRecordFilterInput.prototype, "dateTo", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SacramentalRecordFilterInput.prototype, "branchId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SacramentalRecordFilterInput.prototype, "organisationId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SacramentalRecordFilterInput.prototype, "certificateNumber", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SacramentalRecordFilterInput.prototype, "officiantName", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SacramentalRecordFilterInput.prototype, "locationOfSacrament", void 0);
exports.SacramentalRecordFilterInput = SacramentalRecordFilterInput = __decorate([
    (0, graphql_1.InputType)()
], SacramentalRecordFilterInput);
//# sourceMappingURL=sacramental-record-filter.input.js.map