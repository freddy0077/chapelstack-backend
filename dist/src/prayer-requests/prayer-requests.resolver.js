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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrayerRequestsResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const prayer_requests_service_1 = require("./prayer-requests.service");
const prayer_request_entity_1 = require("./prayer-request.entity");
const create_prayer_request_input_1 = require("./dto/create-prayer-request.input");
const update_prayer_request_input_1 = require("./dto/update-prayer-request.input");
const prayer_request_status_enum_1 = require("./prayer-request-status.enum");
let PrayerRequestsResolver = class PrayerRequestsResolver {
    service;
    constructor(service) {
        this.service = service;
    }
    createPrayerRequest(data) {
        return this.service.create(data);
    }
    prayerRequests(branchId, status, organisationId) {
        return this.service.findAll({ branchId, status, organisationId });
    }
    prayerRequest(id) {
        return this.service.findOne(id);
    }
    updatePrayerRequest(id, data) {
        return this.service.update(id, data);
    }
    removePrayerRequest(id) {
        return this.service.remove(id);
    }
};
exports.PrayerRequestsResolver = PrayerRequestsResolver;
__decorate([
    (0, graphql_1.Mutation)(() => prayer_request_entity_1.PrayerRequest),
    __param(0, (0, graphql_1.Args)('data')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_prayer_request_input_1.CreatePrayerRequestInput]),
    __metadata("design:returntype", void 0)
], PrayerRequestsResolver.prototype, "createPrayerRequest", null);
__decorate([
    (0, graphql_1.Query)(() => [prayer_request_entity_1.PrayerRequest]),
    __param(0, (0, graphql_1.Args)('branchId', { type: () => String, nullable: true })),
    __param(1, (0, graphql_1.Args)('status', { type: () => prayer_request_status_enum_1.PrayerRequestStatusEnum, nullable: true })),
    __param(2, (0, graphql_1.Args)('organisationId', { type: () => String, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], PrayerRequestsResolver.prototype, "prayerRequests", null);
__decorate([
    (0, graphql_1.Query)(() => prayer_request_entity_1.PrayerRequest),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PrayerRequestsResolver.prototype, "prayerRequest", null);
__decorate([
    (0, graphql_1.Mutation)(() => prayer_request_entity_1.PrayerRequest),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('data')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_prayer_request_input_1.UpdatePrayerRequestInput]),
    __metadata("design:returntype", void 0)
], PrayerRequestsResolver.prototype, "updatePrayerRequest", null);
__decorate([
    (0, graphql_1.Mutation)(() => prayer_request_entity_1.PrayerRequest),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PrayerRequestsResolver.prototype, "removePrayerRequest", null);
exports.PrayerRequestsResolver = PrayerRequestsResolver = __decorate([
    (0, graphql_1.Resolver)(() => prayer_request_entity_1.PrayerRequest),
    __metadata("design:paramtypes", [prayer_requests_service_1.PrayerRequestsService])
], PrayerRequestsResolver);
//# sourceMappingURL=prayer-requests.resolver.js.map