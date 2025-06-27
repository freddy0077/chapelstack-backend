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
exports.AttendanceRecord = void 0;
const graphql_1 = require("@nestjs/graphql");
const member_entity_1 = require("../../members/entities/member.entity");
const user_entity_1 = require("../../users/entities/user.entity");
const branch_entity_1 = require("../../branches/entities/branch.entity");
const attendance_session_entity_1 = require("./attendance-session.entity");
let AttendanceRecord = class AttendanceRecord {
    id;
    checkInTime;
    checkOutTime;
    checkInMethod;
    notes;
    session;
    member;
    visitorName;
    visitorEmail;
    visitorPhone;
    recordedBy;
    branch;
    createdAt;
    updatedAt;
};
exports.AttendanceRecord = AttendanceRecord;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], AttendanceRecord.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.GraphQLISODateTime),
    __metadata("design:type", Date)
], AttendanceRecord.prototype, "checkInTime", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.GraphQLISODateTime, { nullable: true }),
    __metadata("design:type", Date)
], AttendanceRecord.prototype, "checkOutTime", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AttendanceRecord.prototype, "checkInMethod", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AttendanceRecord.prototype, "notes", void 0);
__decorate([
    (0, graphql_1.Field)(() => attendance_session_entity_1.AttendanceSession, { nullable: true }),
    __metadata("design:type", attendance_session_entity_1.AttendanceSession)
], AttendanceRecord.prototype, "session", void 0);
__decorate([
    (0, graphql_1.Field)(() => member_entity_1.Member, { nullable: true }),
    __metadata("design:type", member_entity_1.Member)
], AttendanceRecord.prototype, "member", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AttendanceRecord.prototype, "visitorName", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AttendanceRecord.prototype, "visitorEmail", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AttendanceRecord.prototype, "visitorPhone", void 0);
__decorate([
    (0, graphql_1.Field)(() => user_entity_1.User, { nullable: true }),
    __metadata("design:type", user_entity_1.User)
], AttendanceRecord.prototype, "recordedBy", void 0);
__decorate([
    (0, graphql_1.Field)(() => branch_entity_1.Branch, { nullable: true }),
    __metadata("design:type", branch_entity_1.Branch)
], AttendanceRecord.prototype, "branch", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.GraphQLISODateTime),
    __metadata("design:type", Date)
], AttendanceRecord.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.GraphQLISODateTime),
    __metadata("design:type", Date)
], AttendanceRecord.prototype, "updatedAt", void 0);
exports.AttendanceRecord = AttendanceRecord = __decorate([
    (0, graphql_1.ObjectType)()
], AttendanceRecord);
//# sourceMappingURL=attendance-record.entity.js.map