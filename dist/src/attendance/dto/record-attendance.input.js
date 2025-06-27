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
exports.RecordAttendanceInput = exports.CheckInMethod = void 0;
const graphql_1 = require("@nestjs/graphql");
const class_validator_1 = require("class-validator");
const graphql_2 = require("@nestjs/graphql");
var CheckInMethod;
(function (CheckInMethod) {
    CheckInMethod["MANUAL"] = "MANUAL";
    CheckInMethod["MOBILE"] = "MOBILE";
    CheckInMethod["RFID"] = "RFID";
    CheckInMethod["NFC"] = "NFC";
    CheckInMethod["QR_CODE"] = "QR_CODE";
})(CheckInMethod || (exports.CheckInMethod = CheckInMethod = {}));
let RecordAttendanceInput = class RecordAttendanceInput {
    sessionId;
    checkInTime;
    checkInMethod = CheckInMethod.MANUAL;
    notes;
    memberId;
    visitorName;
    visitorEmail;
    visitorPhone;
    recordedById;
    branchId;
};
exports.RecordAttendanceInput = RecordAttendanceInput;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], RecordAttendanceInput.prototype, "sessionId", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_2.GraphQLISODateTime, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], RecordAttendanceInput.prototype, "checkInTime", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(CheckInMethod),
    __metadata("design:type", String)
], RecordAttendanceInput.prototype, "checkInMethod", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RecordAttendanceInput.prototype, "notes", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], RecordAttendanceInput.prototype, "memberId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RecordAttendanceInput.prototype, "visitorName", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], RecordAttendanceInput.prototype, "visitorEmail", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RecordAttendanceInput.prototype, "visitorPhone", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], RecordAttendanceInput.prototype, "recordedById", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], RecordAttendanceInput.prototype, "branchId", void 0);
exports.RecordAttendanceInput = RecordAttendanceInput = __decorate([
    (0, graphql_1.InputType)()
], RecordAttendanceInput);
//# sourceMappingURL=record-attendance.input.js.map