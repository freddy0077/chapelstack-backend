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
exports.CreateAttendanceSessionInput = exports.SessionStatus = exports.SessionType = void 0;
const graphql_1 = require("@nestjs/graphql");
const class_validator_1 = require("class-validator");
const graphql_2 = require("@nestjs/graphql");
var SessionType;
(function (SessionType) {
    SessionType["REGULAR_SERVICE"] = "REGULAR_SERVICE";
    SessionType["SPECIAL_EVENT"] = "SPECIAL_EVENT";
    SessionType["BIBLE_STUDY"] = "BIBLE_STUDY";
    SessionType["PRAYER_MEETING"] = "PRAYER_MEETING";
    SessionType["OTHER"] = "OTHER";
})(SessionType || (exports.SessionType = SessionType = {}));
var SessionStatus;
(function (SessionStatus) {
    SessionStatus["PLANNED"] = "PLANNED";
    SessionStatus["ACTIVE"] = "ACTIVE";
    SessionStatus["COMPLETED"] = "COMPLETED";
    SessionStatus["CANCELLED"] = "CANCELLED";
})(SessionStatus || (exports.SessionStatus = SessionStatus = {}));
let CreateAttendanceSessionInput = class CreateAttendanceSessionInput {
    name;
    description;
    date;
    startTime;
    endTime;
    type;
    status = SessionStatus.PLANNED;
    location;
    latitude;
    longitude;
    branchId;
    organisationId;
};
exports.CreateAttendanceSessionInput = CreateAttendanceSessionInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAttendanceSessionInput.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAttendanceSessionInput.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_2.GraphQLISODateTime),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], CreateAttendanceSessionInput.prototype, "date", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_2.GraphQLISODateTime),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], CreateAttendanceSessionInput.prototype, "startTime", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_2.GraphQLISODateTime, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], CreateAttendanceSessionInput.prototype, "endTime", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEnum)(SessionType),
    __metadata("design:type", String)
], CreateAttendanceSessionInput.prototype, "type", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(SessionStatus),
    __metadata("design:type", String)
], CreateAttendanceSessionInput.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAttendanceSessionInput.prototype, "location", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateAttendanceSessionInput.prototype, "latitude", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateAttendanceSessionInput.prototype, "longitude", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAttendanceSessionInput.prototype, "branchId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAttendanceSessionInput.prototype, "organisationId", void 0);
exports.CreateAttendanceSessionInput = CreateAttendanceSessionInput = __decorate([
    (0, graphql_1.InputType)()
], CreateAttendanceSessionInput);
//# sourceMappingURL=create-attendance-session.input.js.map