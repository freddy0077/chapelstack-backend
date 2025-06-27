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
exports.VolunteersResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const volunteers_service_1 = require("../services/volunteers.service");
const events_service_1 = require("../services/events.service");
const children_ministry_volunteer_entity_1 = require("../entities/children-ministry-volunteer.entity");
const create_volunteer_input_1 = require("../dto/create-volunteer.input");
const update_volunteer_input_1 = require("../dto/update-volunteer.input");
const children_event_entity_1 = require("../entities/children-event.entity");
const common_1 = require("@nestjs/common");
const gql_auth_guard_1 = require("../../auth/guards/gql-auth.guard");
const permissions_guard_1 = require("../../auth/guards/permissions.guard");
const require_permissions_decorator_1 = require("../../auth/decorators/require-permissions.decorator");
const graphql_2 = require("@nestjs/graphql");
const volunteer_schedule_dto_1 = require("../dto/volunteer-schedule.dto");
let VolunteersResolver = class VolunteersResolver {
    volunteersService;
    eventsService;
    constructor(volunteersService, eventsService) {
        this.volunteersService = volunteersService;
        this.eventsService = eventsService;
    }
    createChildrenMinistryVolunteer(createVolunteerInput) {
        return this.volunteersService.create(createVolunteerInput);
    }
    findAll(branchId, isActive) {
        return this.volunteersService.findAll(branchId, isActive);
    }
    findOne(id) {
        return this.volunteersService.findOne(id);
    }
    findByMember(memberId) {
        return this.volunteersService.findByMember(memberId);
    }
    updateChildrenMinistryVolunteer(updateVolunteerInput) {
        return this.volunteersService.update(updateVolunteerInput.id, updateVolunteerInput);
    }
    removeChildrenMinistryVolunteer(id) {
        return this.volunteersService.remove(id);
    }
    updateBackgroundCheck(id, backgroundCheckDate, backgroundCheckStatus) {
        return this.volunteersService.updateBackgroundCheck(id, backgroundCheckDate, backgroundCheckStatus);
    }
    updateTrainingCompletion(id, trainingCompletionDate) {
        return this.volunteersService.updateTrainingCompletion(id, trainingCompletionDate);
    }
    getVolunteerSchedule(id, startDate, endDate) {
        return this.volunteersService.getVolunteerSchedule(id, startDate, endDate);
    }
    async getUpcomingEvents(volunteer) {
        const now = new Date();
        const schedule = await this.volunteersService.getVolunteerSchedule(volunteer.id, now);
        return schedule.map((item) => item.event);
    }
};
exports.VolunteersResolver = VolunteersResolver;
__decorate([
    (0, graphql_1.Mutation)(() => children_ministry_volunteer_entity_1.ChildrenMinistryVolunteer),
    (0, require_permissions_decorator_1.RequirePermissions)({
        action: 'create',
        subject: 'ChildrenMinistryVolunteer',
    }),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_volunteer_input_1.CreateVolunteerInput]),
    __metadata("design:returntype", Promise)
], VolunteersResolver.prototype, "createChildrenMinistryVolunteer", null);
__decorate([
    (0, graphql_1.Query)(() => [children_ministry_volunteer_entity_1.ChildrenMinistryVolunteer], {
        name: 'childrenMinistryVolunteers',
    }),
    (0, require_permissions_decorator_1.RequirePermissions)({ action: 'read', subject: 'ChildrenMinistryVolunteer' }),
    __param(0, (0, graphql_1.Args)('branchId', { nullable: true })),
    __param(1, (0, graphql_1.Args)('isActive', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean]),
    __metadata("design:returntype", Promise)
], VolunteersResolver.prototype, "findAll", null);
__decorate([
    (0, graphql_1.Query)(() => children_ministry_volunteer_entity_1.ChildrenMinistryVolunteer, { name: 'childrenMinistryVolunteer' }),
    (0, require_permissions_decorator_1.RequirePermissions)({ action: 'read', subject: 'ChildrenMinistryVolunteer' }),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VolunteersResolver.prototype, "findOne", null);
__decorate([
    (0, graphql_1.Query)(() => children_ministry_volunteer_entity_1.ChildrenMinistryVolunteer, {
        name: 'childrenMinistryVolunteerByMember',
        nullable: true,
    }),
    (0, require_permissions_decorator_1.RequirePermissions)({ action: 'read', subject: 'ChildrenMinistryVolunteer' }),
    __param(0, (0, graphql_1.Args)('memberId', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VolunteersResolver.prototype, "findByMember", null);
__decorate([
    (0, graphql_1.Mutation)(() => children_ministry_volunteer_entity_1.ChildrenMinistryVolunteer),
    (0, require_permissions_decorator_1.RequirePermissions)({
        action: 'update',
        subject: 'ChildrenMinistryVolunteer',
    }),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_volunteer_input_1.UpdateVolunteerInput]),
    __metadata("design:returntype", Promise)
], VolunteersResolver.prototype, "updateChildrenMinistryVolunteer", null);
__decorate([
    (0, graphql_1.Mutation)(() => children_ministry_volunteer_entity_1.ChildrenMinistryVolunteer),
    (0, require_permissions_decorator_1.RequirePermissions)({
        action: 'delete',
        subject: 'ChildrenMinistryVolunteer',
    }),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VolunteersResolver.prototype, "removeChildrenMinistryVolunteer", null);
__decorate([
    (0, graphql_1.Mutation)(() => children_ministry_volunteer_entity_1.ChildrenMinistryVolunteer),
    (0, require_permissions_decorator_1.RequirePermissions)({
        action: 'update',
        subject: 'ChildrenMinistryVolunteer',
    }),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('backgroundCheckDate', { type: () => graphql_2.GraphQLISODateTime })),
    __param(2, (0, graphql_1.Args)('backgroundCheckStatus')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Date, String]),
    __metadata("design:returntype", Promise)
], VolunteersResolver.prototype, "updateBackgroundCheck", null);
__decorate([
    (0, graphql_1.Mutation)(() => children_ministry_volunteer_entity_1.ChildrenMinistryVolunteer),
    (0, require_permissions_decorator_1.RequirePermissions)({
        action: 'update',
        subject: 'ChildrenMinistryVolunteer',
    }),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('trainingCompletionDate', { type: () => graphql_2.GraphQLISODateTime })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Date]),
    __metadata("design:returntype", Promise)
], VolunteersResolver.prototype, "updateTrainingCompletion", null);
__decorate([
    (0, graphql_1.Query)(() => [volunteer_schedule_dto_1.VolunteerScheduleItem], { name: 'volunteerSchedule' }),
    (0, require_permissions_decorator_1.RequirePermissions)({ action: 'read', subject: 'ChildrenMinistryVolunteer' }),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('startDate', { nullable: true, type: () => graphql_2.GraphQLISODateTime })),
    __param(2, (0, graphql_1.Args)('endDate', { nullable: true, type: () => graphql_2.GraphQLISODateTime })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Date,
        Date]),
    __metadata("design:returntype", Promise)
], VolunteersResolver.prototype, "getVolunteerSchedule", null);
__decorate([
    (0, graphql_1.ResolveField)('upcomingEvents', () => [children_event_entity_1.ChildrenEvent]),
    __param(0, (0, graphql_1.Parent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [children_ministry_volunteer_entity_1.ChildrenMinistryVolunteer]),
    __metadata("design:returntype", Promise)
], VolunteersResolver.prototype, "getUpcomingEvents", null);
exports.VolunteersResolver = VolunteersResolver = __decorate([
    (0, graphql_1.Resolver)(() => children_ministry_volunteer_entity_1.ChildrenMinistryVolunteer),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [volunteers_service_1.VolunteersService,
        events_service_1.EventsService])
], VolunteersResolver);
//# sourceMappingURL=volunteers.resolver.js.map