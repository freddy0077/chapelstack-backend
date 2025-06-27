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
exports.AttendanceSession = void 0;
const graphql_1 = require("@nestjs/graphql");
const graphql_2 = require("@nestjs/graphql");
let AttendanceSession = class AttendanceSession {
    id;
    name;
    description;
    date;
    startTime;
    endTime;
    type;
    status;
    location;
    latitude;
    longitude;
    branchId;
    organisationId;
    createdAt;
    updatedAt;
};
exports.AttendanceSession = AttendanceSession;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], AttendanceSession.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AttendanceSession.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AttendanceSession.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_2.GraphQLISODateTime),
    __metadata("design:type", Date)
], AttendanceSession.prototype, "date", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_2.GraphQLISODateTime),
    __metadata("design:type", Date)
], AttendanceSession.prototype, "startTime", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_2.GraphQLISODateTime, { nullable: true }),
    __metadata("design:type", Date)
], AttendanceSession.prototype, "endTime", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AttendanceSession.prototype, "type", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], AttendanceSession.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AttendanceSession.prototype, "location", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Number)
], AttendanceSession.prototype, "latitude", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Number)
], AttendanceSession.prototype, "longitude", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AttendanceSession.prototype, "branchId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], AttendanceSession.prototype, "organisationId", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_2.GraphQLISODateTime),
    __metadata("design:type", Date)
], AttendanceSession.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_2.GraphQLISODateTime),
    __metadata("design:type", Date)
], AttendanceSession.prototype, "updatedAt", void 0);
exports.AttendanceSession = AttendanceSession = __decorate([
    (0, graphql_1.ObjectType)()
], AttendanceSession);
//# sourceMappingURL=attendance-session.entity.js.map