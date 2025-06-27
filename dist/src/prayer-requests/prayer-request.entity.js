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
exports.PrayerRequest = void 0;
const graphql_1 = require("@nestjs/graphql");
const prayer_request_status_enum_1 = require("./prayer-request-status.enum");
const member_entity_1 = require("../members/entities/member.entity");
let PrayerRequest = class PrayerRequest {
    id;
    memberId;
    member;
    branchId;
    requestText;
    status;
    assignedPastorId;
    organisationId;
    createdAt;
    updatedAt;
};
exports.PrayerRequest = PrayerRequest;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], PrayerRequest.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], PrayerRequest.prototype, "memberId", void 0);
__decorate([
    (0, graphql_1.Field)(() => member_entity_1.Member),
    __metadata("design:type", member_entity_1.Member)
], PrayerRequest.prototype, "member", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], PrayerRequest.prototype, "branchId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], PrayerRequest.prototype, "requestText", void 0);
__decorate([
    (0, graphql_1.Field)(() => prayer_request_status_enum_1.PrayerRequestStatusEnum),
    __metadata("design:type", String)
], PrayerRequest.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], PrayerRequest.prototype, "assignedPastorId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], PrayerRequest.prototype, "organisationId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], PrayerRequest.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], PrayerRequest.prototype, "updatedAt", void 0);
exports.PrayerRequest = PrayerRequest = __decorate([
    (0, graphql_1.ObjectType)()
], PrayerRequest);
//# sourceMappingURL=prayer-request.entity.js.map