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
exports.EventAttendanceOutput = exports.EventAttendanceStats = void 0;
const graphql_1 = require("@nestjs/graphql");
const children_event_entity_1 = require("../entities/children-event.entity");
const check_in_record_entity_1 = require("../entities/check-in-record.entity");
let EventAttendanceStats = class EventAttendanceStats {
    totalCheckedIn;
    totalCheckedOut;
    currentlyPresent;
};
exports.EventAttendanceStats = EventAttendanceStats;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], EventAttendanceStats.prototype, "totalCheckedIn", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], EventAttendanceStats.prototype, "totalCheckedOut", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], EventAttendanceStats.prototype, "currentlyPresent", void 0);
exports.EventAttendanceStats = EventAttendanceStats = __decorate([
    (0, graphql_1.ObjectType)()
], EventAttendanceStats);
let EventAttendanceOutput = class EventAttendanceOutput {
    event;
    checkIns;
    stats;
};
exports.EventAttendanceOutput = EventAttendanceOutput;
__decorate([
    (0, graphql_1.Field)(() => children_event_entity_1.ChildrenEvent),
    __metadata("design:type", children_event_entity_1.ChildrenEvent)
], EventAttendanceOutput.prototype, "event", void 0);
__decorate([
    (0, graphql_1.Field)(() => [check_in_record_entity_1.CheckInRecord]),
    __metadata("design:type", Array)
], EventAttendanceOutput.prototype, "checkIns", void 0);
__decorate([
    (0, graphql_1.Field)(() => EventAttendanceStats),
    __metadata("design:type", EventAttendanceStats)
], EventAttendanceOutput.prototype, "stats", void 0);
exports.EventAttendanceOutput = EventAttendanceOutput = __decorate([
    (0, graphql_1.ObjectType)()
], EventAttendanceOutput);
//# sourceMappingURL=event-attendance.dto.js.map