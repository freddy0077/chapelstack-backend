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
exports.VolunteersController = void 0;
const common_1 = require("@nestjs/common");
const volunteers_service_1 = require("../services/volunteers.service");
const create_volunteer_input_1 = require("../dto/create-volunteer.input");
const update_volunteer_input_1 = require("../dto/update-volunteer.input");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const permissions_guard_1 = require("../../auth/guards/permissions.guard");
const require_permissions_decorator_1 = require("../../auth/decorators/require-permissions.decorator");
let VolunteersController = class VolunteersController {
    volunteersService;
    constructor(volunteersService) {
        this.volunteersService = volunteersService;
    }
    create(createVolunteerInput) {
        return this.volunteersService.create(createVolunteerInput);
    }
    findAll(branchId, isActive) {
        return this.volunteersService.findAll(branchId, isActive !== undefined ? isActive === true : undefined);
    }
    findOne(id) {
        return this.volunteersService.findOne(id);
    }
    findByMember(memberId) {
        return this.volunteersService.findByMember(memberId);
    }
    findByEvent(eventId) {
        return this.volunteersService.findByEvent(eventId);
    }
    update(id, updateVolunteerInput) {
        return this.volunteersService.update(id, updateVolunteerInput);
    }
    remove(id) {
        return this.volunteersService.remove(id);
    }
    updateBackgroundCheck(id, backgroundCheckDate, backgroundCheckStatus) {
        return this.volunteersService.updateBackgroundCheck(id, new Date(backgroundCheckDate), backgroundCheckStatus);
    }
    updateTrainingCompletion(id, trainingCompletionDate) {
        return this.volunteersService.updateTrainingCompletion(id, new Date(trainingCompletionDate));
    }
    getVolunteerSchedule(id, startDate, endDate) {
        return this.volunteersService.getVolunteerSchedule(id, startDate ? new Date(startDate) : undefined, endDate ? new Date(endDate) : undefined);
    }
};
exports.VolunteersController = VolunteersController;
__decorate([
    (0, common_1.Post)(),
    (0, require_permissions_decorator_1.RequirePermissions)({
        action: 'create',
        subject: 'ChildrenMinistryVolunteer',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_volunteer_input_1.CreateVolunteerInput]),
    __metadata("design:returntype", Promise)
], VolunteersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, require_permissions_decorator_1.RequirePermissions)({ action: 'read', subject: 'ChildrenMinistryVolunteer' }),
    __param(0, (0, common_1.Query)('branchId')),
    __param(1, (0, common_1.Query)('isActive')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean]),
    __metadata("design:returntype", Promise)
], VolunteersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)({ action: 'read', subject: 'ChildrenMinistryVolunteer' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VolunteersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('by-member/:memberId'),
    (0, require_permissions_decorator_1.RequirePermissions)({ action: 'read', subject: 'ChildrenMinistryVolunteer' }),
    __param(0, (0, common_1.Param)('memberId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VolunteersController.prototype, "findByMember", null);
__decorate([
    (0, common_1.Get)('by-event/:eventId'),
    (0, require_permissions_decorator_1.RequirePermissions)({ action: 'read', subject: 'ChildrenMinistryVolunteer' }),
    __param(0, (0, common_1.Param)('eventId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VolunteersController.prototype, "findByEvent", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)({
        action: 'update',
        subject: 'ChildrenMinistryVolunteer',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_volunteer_input_1.UpdateVolunteerInput]),
    __metadata("design:returntype", Promise)
], VolunteersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)({
        action: 'delete',
        subject: 'ChildrenMinistryVolunteer',
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VolunteersController.prototype, "remove", null);
__decorate([
    (0, common_1.Patch)(':id/background-check'),
    (0, require_permissions_decorator_1.RequirePermissions)({
        action: 'update',
        subject: 'ChildrenMinistryVolunteer',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('backgroundCheckDate')),
    __param(2, (0, common_1.Body)('backgroundCheckStatus')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], VolunteersController.prototype, "updateBackgroundCheck", null);
__decorate([
    (0, common_1.Patch)(':id/training-completion'),
    (0, require_permissions_decorator_1.RequirePermissions)({
        action: 'update',
        subject: 'ChildrenMinistryVolunteer',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('trainingCompletionDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], VolunteersController.prototype, "updateTrainingCompletion", null);
__decorate([
    (0, common_1.Get)(':id/schedule'),
    (0, require_permissions_decorator_1.RequirePermissions)({ action: 'read', subject: 'ChildrenMinistryVolunteer' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], VolunteersController.prototype, "getVolunteerSchedule", null);
exports.VolunteersController = VolunteersController = __decorate([
    (0, common_1.Controller)('children-volunteers'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [volunteers_service_1.VolunteersService])
], VolunteersController);
//# sourceMappingURL=volunteers.controller.js.map