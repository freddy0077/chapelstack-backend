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
exports.CheckinResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const checkin_service_1 = require("../services/checkin.service");
const check_in_record_entity_1 = require("../entities/check-in-record.entity");
const check_in_input_1 = require("../dto/check-in.input");
const check_out_input_1 = require("../dto/check-out.input");
const common_1 = require("@nestjs/common");
const gql_auth_guard_1 = require("../../auth/guards/gql-auth.guard");
const permissions_guard_1 = require("../../auth/guards/permissions.guard");
const require_permissions_decorator_1 = require("../../auth/decorators/require-permissions.decorator");
const graphql_2 = require("@nestjs/graphql");
const checkin_stats_dto_1 = require("../dto/checkin-stats.dto");
let CheckinResolver = class CheckinResolver {
    checkinService;
    constructor(checkinService) {
        this.checkinService = checkinService;
    }
    checkInChild(checkInInput) {
        return this.checkinService.checkIn(checkInInput);
    }
    checkOutChild(checkOutInput) {
        return this.checkinService.checkOut(checkOutInput);
    }
    findActiveCheckIns(branchId, eventId) {
        return this.checkinService.findActiveCheckIns(branchId, eventId);
    }
    findCheckInHistory(branchId, dateFrom, dateTo, childId, eventId) {
        return this.checkinService.findCheckInHistory(branchId, dateFrom, dateTo, childId, eventId);
    }
    getCheckInStats(branchId, dateFrom, dateTo) {
        return this.checkinService.getCheckInStats(branchId, dateFrom, dateTo);
    }
};
exports.CheckinResolver = CheckinResolver;
__decorate([
    (0, graphql_1.Mutation)(() => check_in_record_entity_1.CheckInRecord),
    (0, require_permissions_decorator_1.RequirePermissions)({ action: 'create', subject: 'CheckInRecord' }),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [check_in_input_1.CheckInInput]),
    __metadata("design:returntype", Promise)
], CheckinResolver.prototype, "checkInChild", null);
__decorate([
    (0, graphql_1.Mutation)(() => check_in_record_entity_1.CheckInRecord),
    (0, require_permissions_decorator_1.RequirePermissions)({ action: 'update', subject: 'CheckInRecord' }),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [check_out_input_1.CheckOutInput]),
    __metadata("design:returntype", Promise)
], CheckinResolver.prototype, "checkOutChild", null);
__decorate([
    (0, graphql_1.Query)(() => [check_in_record_entity_1.CheckInRecord], { name: 'activeCheckIns' }),
    (0, require_permissions_decorator_1.RequirePermissions)({ action: 'read', subject: 'CheckInRecord' }),
    __param(0, (0, graphql_1.Args)('branchId')),
    __param(1, (0, graphql_1.Args)('eventId', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CheckinResolver.prototype, "findActiveCheckIns", null);
__decorate([
    (0, graphql_1.Query)(() => [check_in_record_entity_1.CheckInRecord], { name: 'checkInHistory' }),
    (0, require_permissions_decorator_1.RequirePermissions)({ action: 'read', subject: 'CheckInRecord' }),
    __param(0, (0, graphql_1.Args)('branchId')),
    __param(1, (0, graphql_1.Args)('dateFrom', { nullable: true, type: () => graphql_2.GraphQLISODateTime })),
    __param(2, (0, graphql_1.Args)('dateTo', { nullable: true, type: () => graphql_2.GraphQLISODateTime })),
    __param(3, (0, graphql_1.Args)('childId', { nullable: true })),
    __param(4, (0, graphql_1.Args)('eventId', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Date,
        Date, String, String]),
    __metadata("design:returntype", Promise)
], CheckinResolver.prototype, "findCheckInHistory", null);
__decorate([
    (0, graphql_1.Query)(() => checkin_stats_dto_1.CheckInStatsOutput, { name: 'checkInStats' }),
    (0, require_permissions_decorator_1.RequirePermissions)({ action: 'read', subject: 'CheckInRecord' }),
    __param(0, (0, graphql_1.Args)('branchId')),
    __param(1, (0, graphql_1.Args)('dateFrom', { nullable: true, type: () => graphql_2.GraphQLISODateTime })),
    __param(2, (0, graphql_1.Args)('dateTo', { nullable: true, type: () => graphql_2.GraphQLISODateTime })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Date,
        Date]),
    __metadata("design:returntype", Promise)
], CheckinResolver.prototype, "getCheckInStats", null);
exports.CheckinResolver = CheckinResolver = __decorate([
    (0, graphql_1.Resolver)(() => check_in_record_entity_1.CheckInRecord),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [checkin_service_1.CheckinService])
], CheckinResolver);
//# sourceMappingURL=checkin.resolver.js.map