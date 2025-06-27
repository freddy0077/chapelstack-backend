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
exports.EventsController = void 0;
const common_1 = require("@nestjs/common");
const events_service_1 = require("../services/events.service");
const create_children_event_input_1 = require("../dto/create-children-event.input");
const update_children_event_input_1 = require("../dto/update-children-event.input");
const create_volunteer_assignment_input_1 = require("../dto/create-volunteer-assignment.input");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const permissions_guard_1 = require("../../auth/guards/permissions.guard");
const require_permissions_decorator_1 = require("../../auth/decorators/require-permissions.decorator");
let EventsController = class EventsController {
    eventsService;
    constructor(eventsService) {
        this.eventsService = eventsService;
    }
    create(createEventInput) {
        return this.eventsService.create(createEventInput);
    }
    findAll(branchId) {
        return this.eventsService.findAll(branchId);
    }
    findUpcomingEvents(branchId) {
        return this.eventsService.findUpcomingEvents(branchId);
    }
    findPastEvents(branchId) {
        return this.eventsService.findPastEvents(branchId);
    }
    findCurrentEvents(branchId) {
        return this.eventsService.findCurrentEvents(branchId);
    }
    findOne(id) {
        return this.eventsService.findOne(id);
    }
    update(id, updateEventInput) {
        return this.eventsService.update(id, updateEventInput);
    }
    remove(id) {
        return this.eventsService.remove(id);
    }
    assignVolunteerToEvent(input) {
        return this.eventsService.assignVolunteerToEvent(input);
    }
    removeVolunteerFromEvent(volunteerId, eventId) {
        return this.eventsService.removeVolunteerFromEvent(volunteerId, eventId);
    }
    getEventAttendance(id) {
        return this.eventsService.getEventAttendance(id);
    }
};
exports.EventsController = EventsController;
__decorate([
    (0, common_1.Post)(),
    (0, require_permissions_decorator_1.RequirePermissions)({ action: 'create', subject: 'ChildrenEvent' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_children_event_input_1.CreateChildrenEventInput]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, require_permissions_decorator_1.RequirePermissions)({ action: 'read', subject: 'ChildrenEvent' }),
    __param(0, (0, common_1.Query)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('upcoming/:branchId'),
    (0, require_permissions_decorator_1.RequirePermissions)({ action: 'read', subject: 'ChildrenEvent' }),
    __param(0, (0, common_1.Param)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "findUpcomingEvents", null);
__decorate([
    (0, common_1.Get)('past/:branchId'),
    (0, require_permissions_decorator_1.RequirePermissions)({ action: 'read', subject: 'ChildrenEvent' }),
    __param(0, (0, common_1.Param)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "findPastEvents", null);
__decorate([
    (0, common_1.Get)('current/:branchId'),
    (0, require_permissions_decorator_1.RequirePermissions)({ action: 'read', subject: 'ChildrenEvent' }),
    __param(0, (0, common_1.Param)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "findCurrentEvents", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)({ action: 'read', subject: 'ChildrenEvent' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)({ action: 'update', subject: 'ChildrenEvent' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_children_event_input_1.UpdateChildrenEventInput]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)({ action: 'delete', subject: 'ChildrenEvent' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('volunteer-assignment'),
    (0, require_permissions_decorator_1.RequirePermissions)({ action: 'create', subject: 'VolunteerEventAssignment' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_volunteer_assignment_input_1.CreateVolunteerAssignmentInput]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "assignVolunteerToEvent", null);
__decorate([
    (0, common_1.Delete)('volunteer-assignment/:volunteerId/:eventId'),
    (0, require_permissions_decorator_1.RequirePermissions)({ action: 'delete', subject: 'VolunteerEventAssignment' }),
    __param(0, (0, common_1.Param)('volunteerId')),
    __param(1, (0, common_1.Param)('eventId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "removeVolunteerFromEvent", null);
__decorate([
    (0, common_1.Get)(':id/attendance'),
    (0, require_permissions_decorator_1.RequirePermissions)({ action: 'read', subject: 'CheckInRecord' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "getEventAttendance", null);
exports.EventsController = EventsController = __decorate([
    (0, common_1.Controller)('children-events'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [events_service_1.EventsService])
], EventsController);
//# sourceMappingURL=events.controller.js.map