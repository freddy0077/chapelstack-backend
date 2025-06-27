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
exports.MemberDashboard = void 0;
const graphql_1 = require("@nestjs/graphql");
let DashboardStat = class DashboardStat {
    groups;
    attendance;
    giving;
};
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], DashboardStat.prototype, "groups", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], DashboardStat.prototype, "attendance", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], DashboardStat.prototype, "giving", void 0);
DashboardStat = __decorate([
    (0, graphql_1.ObjectType)()
], DashboardStat);
let DashboardEvent = class DashboardEvent {
    id;
    name;
    date;
    location;
};
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], DashboardEvent.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], DashboardEvent.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], DashboardEvent.prototype, "date", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], DashboardEvent.prototype, "location", void 0);
DashboardEvent = __decorate([
    (0, graphql_1.ObjectType)()
], DashboardEvent);
let DashboardGroup = class DashboardGroup {
    id;
    name;
    role;
};
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], DashboardGroup.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], DashboardGroup.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], DashboardGroup.prototype, "role", void 0);
DashboardGroup = __decorate([
    (0, graphql_1.ObjectType)()
], DashboardGroup);
let DashboardMilestone = class DashboardMilestone {
    baptismDate;
    confirmationDate;
};
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], DashboardMilestone.prototype, "baptismDate", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], DashboardMilestone.prototype, "confirmationDate", void 0);
DashboardMilestone = __decorate([
    (0, graphql_1.ObjectType)()
], DashboardMilestone);
let MemberDashboard = class MemberDashboard {
    id;
    firstName;
    lastName;
    profileImageUrl;
    membershipStatus;
    membershipDate;
    stats;
    upcomingEvents;
    groups;
    milestones;
};
exports.MemberDashboard = MemberDashboard;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], MemberDashboard.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], MemberDashboard.prototype, "firstName", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], MemberDashboard.prototype, "lastName", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], MemberDashboard.prototype, "profileImageUrl", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], MemberDashboard.prototype, "membershipStatus", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], MemberDashboard.prototype, "membershipDate", void 0);
__decorate([
    (0, graphql_1.Field)(() => DashboardStat),
    __metadata("design:type", DashboardStat)
], MemberDashboard.prototype, "stats", void 0);
__decorate([
    (0, graphql_1.Field)(() => [DashboardEvent]),
    __metadata("design:type", Array)
], MemberDashboard.prototype, "upcomingEvents", void 0);
__decorate([
    (0, graphql_1.Field)(() => [DashboardGroup]),
    __metadata("design:type", Array)
], MemberDashboard.prototype, "groups", void 0);
__decorate([
    (0, graphql_1.Field)(() => DashboardMilestone),
    __metadata("design:type", DashboardMilestone)
], MemberDashboard.prototype, "milestones", void 0);
exports.MemberDashboard = MemberDashboard = __decorate([
    (0, graphql_1.ObjectType)()
], MemberDashboard);
//# sourceMappingURL=member-dashboard.dto.js.map