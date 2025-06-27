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
exports.VolunteerScheduleItem = void 0;
const graphql_1 = require("@nestjs/graphql");
const volunteer_event_assignment_entity_1 = require("../entities/volunteer-event-assignment.entity");
const children_event_entity_1 = require("../entities/children-event.entity");
let VolunteerScheduleItem = class VolunteerScheduleItem {
    assignment;
    event;
};
exports.VolunteerScheduleItem = VolunteerScheduleItem;
__decorate([
    (0, graphql_1.Field)(() => volunteer_event_assignment_entity_1.VolunteerEventAssignment),
    __metadata("design:type", volunteer_event_assignment_entity_1.VolunteerEventAssignment)
], VolunteerScheduleItem.prototype, "assignment", void 0);
__decorate([
    (0, graphql_1.Field)(() => children_event_entity_1.ChildrenEvent),
    __metadata("design:type", children_event_entity_1.ChildrenEvent)
], VolunteerScheduleItem.prototype, "event", void 0);
exports.VolunteerScheduleItem = VolunteerScheduleItem = __decorate([
    (0, graphql_1.ObjectType)()
], VolunteerScheduleItem);
//# sourceMappingURL=volunteer-schedule.dto.js.map