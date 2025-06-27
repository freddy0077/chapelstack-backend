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
exports.CheckinController = void 0;
const common_1 = require("@nestjs/common");
const checkin_service_1 = require("../services/checkin.service");
const check_in_input_1 = require("../dto/check-in.input");
const check_out_input_1 = require("../dto/check-out.input");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const permissions_guard_1 = require("../../auth/guards/permissions.guard");
const require_permissions_decorator_1 = require("../../auth/decorators/require-permissions.decorator");
let CheckinController = class CheckinController {
    checkinService;
    constructor(checkinService) {
        this.checkinService = checkinService;
    }
    checkIn(checkInInput) {
        return this.checkinService.checkIn(checkInInput);
    }
    checkOut(checkOutInput) {
        return this.checkinService.checkOut(checkOutInput);
    }
    findActiveCheckIns(branchId, eventId) {
        return this.checkinService.findActiveCheckIns(branchId, eventId);
    }
    findCheckInHistory(branchId, dateFrom, dateTo, childId, eventId) {
        return this.checkinService.findCheckInHistory(branchId, dateFrom ? new Date(dateFrom) : undefined, dateTo ? new Date(dateTo) : undefined, childId, eventId);
    }
    getCheckInStats(branchId, dateFrom, dateTo) {
        return this.checkinService.getCheckInStats(branchId, dateFrom ? new Date(dateFrom) : undefined, dateTo ? new Date(dateTo) : undefined);
    }
};
exports.CheckinController = CheckinController;
__decorate([
    (0, common_1.Post)('check-in'),
    (0, require_permissions_decorator_1.RequirePermissions)({ action: 'create', subject: 'CheckInRecord' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [check_in_input_1.CheckInInput]),
    __metadata("design:returntype", Promise)
], CheckinController.prototype, "checkIn", null);
__decorate([
    (0, common_1.Post)('check-out'),
    (0, require_permissions_decorator_1.RequirePermissions)({ action: 'update', subject: 'CheckInRecord' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [check_out_input_1.CheckOutInput]),
    __metadata("design:returntype", Promise)
], CheckinController.prototype, "checkOut", null);
__decorate([
    (0, common_1.Get)('active'),
    (0, require_permissions_decorator_1.RequirePermissions)({ action: 'read', subject: 'CheckInRecord' }),
    __param(0, (0, common_1.Query)('branchId')),
    __param(1, (0, common_1.Query)('eventId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CheckinController.prototype, "findActiveCheckIns", null);
__decorate([
    (0, common_1.Get)('history'),
    (0, require_permissions_decorator_1.RequirePermissions)({ action: 'read', subject: 'CheckInRecord' }),
    __param(0, (0, common_1.Query)('branchId')),
    __param(1, (0, common_1.Query)('dateFrom')),
    __param(2, (0, common_1.Query)('dateTo')),
    __param(3, (0, common_1.Query)('childId')),
    __param(4, (0, common_1.Query)('eventId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], CheckinController.prototype, "findCheckInHistory", null);
__decorate([
    (0, common_1.Get)('stats/:branchId'),
    (0, require_permissions_decorator_1.RequirePermissions)({ action: 'read', subject: 'CheckInRecord' }),
    __param(0, (0, common_1.Param)('branchId')),
    __param(1, (0, common_1.Query)('dateFrom')),
    __param(2, (0, common_1.Query)('dateTo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], CheckinController.prototype, "getCheckInStats", null);
exports.CheckinController = CheckinController = __decorate([
    (0, common_1.Controller)('checkin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [checkin_service_1.CheckinService])
], CheckinController);
//# sourceMappingURL=checkin.controller.js.map