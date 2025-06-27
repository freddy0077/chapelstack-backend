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
exports.EventsResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const events_service_1 = require("../services/events.service");
const volunteers_service_1 = require("../services/volunteers.service");
const children_event_entity_1 = require("../entities/children-event.entity");
const create_children_event_input_1 = require("../dto/create-children-event.input");
const update_children_event_input_1 = require("../dto/update-children-event.input");
const create_volunteer_assignment_input_1 = require("../dto/create-volunteer-assignment.input");
const volunteer_event_assignment_entity_1 = require("../entities/volunteer-event-assignment.entity");
const children_ministry_volunteer_entity_1 = require("../entities/children-ministry-volunteer.entity");
const common_1 = require("@nestjs/common");
const gql_auth_guard_1 = require("../../auth/guards/gql-auth.guard");
const permissions_guard_1 = require("../../auth/guards/permissions.guard");
const require_permissions_decorator_1 = require("../../auth/decorators/require-permissions.decorator");
const event_attendance_dto_1 = require("../dto/event-attendance.dto");
let EventsResolver = class EventsResolver {
    eventsService;
    volunteersService;
    constructor(eventsService, volunteersService) {
        this.eventsService = eventsService;
        this.volunteersService = volunteersService;
    }
    createChildrenEvent(createEventInput) {
        return this.eventsService.create(createEventInput);
    }
    findAll(branchId) {
        return this.eventsService.findAll(branchId);
    }
    findOne(id) {
        return this.eventsService.findOne(id);
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
    updateChildrenEvent(updateEventInput) {
        return this.eventsService.update(updateEventInput.id, updateEventInput);
    }
    removeChildrenEvent(id) {
        return this.eventsService.remove(id);
    }
    assignVolunteerToEvent(input) {
        return this.eventsService.assignVolunteerToEvent(input);
    }
    removeVolunteerFromEvent(volunteerId, eventId) {
        return this.eventsService.removeVolunteerFromEvent(volunteerId, eventId);
    }
    getEventAttendance(eventId) {
        return this.eventsService.getEventAttendance(eventId);
    }
    async getVolunteers(event) {
        return this.volunteersService.findByEvent(event.id);
    }
};
exports.EventsResolver = EventsResolver;
__decorate([
    (0, graphql_1.Mutation)(() => children_event_entity_1.ChildrenEvent),
    (0, require_permissions_decorator_1.RequirePermissions)({ action: 'create', subject: 'ChildrenEvent' }),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_children_event_input_1.CreateChildrenEventInput]),
    __metadata("design:returntype", Promise)
], EventsResolver.prototype, "createChildrenEvent", null);
__decorate([
    (0, graphql_1.Query)(() => [children_event_entity_1.ChildrenEvent], { name: 'childrenEvents' }),
    (0, require_permissions_decorator_1.RequirePermissions)({ action: 'read', subject: 'ChildrenEvent' }),
    __param(0, (0, graphql_1.Args)('branchId', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EventsResolver.prototype, "findAll", null);
__decorate([
    (0, graphql_1.Query)(() => children_event_entity_1.ChildrenEvent, { name: 'childrenEvent' }),
    (0, require_permissions_decorator_1.RequirePermissions)({ action: 'read', subject: 'ChildrenEvent' }),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EventsResolver.prototype, "findOne", null);
__decorate([
    (0, graphql_1.Query)(() => [children_event_entity_1.ChildrenEvent], { name: 'upcomingChildrenEvents' }),
    (0, require_permissions_decorator_1.RequirePermissions)({ action: 'read', subject: 'ChildrenEvent' }),
    __param(0, (0, graphql_1.Args)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EventsResolver.prototype, "findUpcomingEvents", null);
__decorate([
    (0, graphql_1.Query)(() => [children_event_entity_1.ChildrenEvent], { name: 'pastChildrenEvents' }),
    (0, require_permissions_decorator_1.RequirePermissions)({ action: 'read', subject: 'ChildrenEvent' }),
    __param(0, (0, graphql_1.Args)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EventsResolver.prototype, "findPastEvents", null);
__decorate([
    (0, graphql_1.Query)(() => [children_event_entity_1.ChildrenEvent], { name: 'currentChildrenEvents' }),
    (0, require_permissions_decorator_1.RequirePermissions)({ action: 'read', subject: 'ChildrenEvent' }),
    __param(0, (0, graphql_1.Args)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EventsResolver.prototype, "findCurrentEvents", null);
__decorate([
    (0, graphql_1.Mutation)(() => children_event_entity_1.ChildrenEvent),
    (0, require_permissions_decorator_1.RequirePermissions)({ action: 'update', subject: 'ChildrenEvent' }),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_children_event_input_1.UpdateChildrenEventInput]),
    __metadata("design:returntype", Promise)
], EventsResolver.prototype, "updateChildrenEvent", null);
__decorate([
    (0, graphql_1.Mutation)(() => children_event_entity_1.ChildrenEvent),
    (0, require_permissions_decorator_1.RequirePermissions)({ action: 'delete', subject: 'ChildrenEvent' }),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EventsResolver.prototype, "removeChildrenEvent", null);
__decorate([
    (0, graphql_1.Mutation)(() => volunteer_event_assignment_entity_1.VolunteerEventAssignment),
    (0, require_permissions_decorator_1.RequirePermissions)({ action: 'create', subject: 'VolunteerEventAssignment' }),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_volunteer_assignment_input_1.CreateVolunteerAssignmentInput]),
    __metadata("design:returntype", Promise)
], EventsResolver.prototype, "assignVolunteerToEvent", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    (0, require_permissions_decorator_1.RequirePermissions)({ action: 'delete', subject: 'VolunteerEventAssignment' }),
    __param(0, (0, graphql_1.Args)('volunteerId', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('eventId', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], EventsResolver.prototype, "removeVolunteerFromEvent", null);
__decorate([
    (0, graphql_1.Query)(() => event_attendance_dto_1.EventAttendanceOutput, { name: 'eventAttendance' }),
    (0, require_permissions_decorator_1.RequirePermissions)({ action: 'read', subject: 'CheckInRecord' }),
    __param(0, (0, graphql_1.Args)('eventId', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EventsResolver.prototype, "getEventAttendance", null);
__decorate([
    (0, graphql_1.ResolveField)('volunteers', () => [children_ministry_volunteer_entity_1.ChildrenMinistryVolunteer]),
    __param(0, (0, graphql_1.Parent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [children_event_entity_1.ChildrenEvent]),
    __metadata("design:returntype", Promise)
], EventsResolver.prototype, "getVolunteers", null);
exports.EventsResolver = EventsResolver = __decorate([
    (0, graphql_1.Resolver)(() => children_event_entity_1.ChildrenEvent),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [events_service_1.EventsService,
        volunteers_service_1.VolunteersService])
], EventsResolver);
//# sourceMappingURL=events.resolver.js.map