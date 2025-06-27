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
exports.MemberStatistics = exports.MemberStatisticsPeriod = void 0;
const graphql_1 = require("@nestjs/graphql");
let MemberStatisticsPeriod = class MemberStatisticsPeriod {
    totalMembers;
    activeMembers;
    inactiveMembers;
    newMembersInPeriod;
    visitorsInPeriod;
};
exports.MemberStatisticsPeriod = MemberStatisticsPeriod;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], MemberStatisticsPeriod.prototype, "totalMembers", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], MemberStatisticsPeriod.prototype, "activeMembers", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], MemberStatisticsPeriod.prototype, "inactiveMembers", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], MemberStatisticsPeriod.prototype, "newMembersInPeriod", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], MemberStatisticsPeriod.prototype, "visitorsInPeriod", void 0);
exports.MemberStatisticsPeriod = MemberStatisticsPeriod = __decorate([
    (0, graphql_1.ObjectType)()
], MemberStatisticsPeriod);
let MemberStatistics = class MemberStatistics {
    totalMembers;
    activeMembers;
    inactiveMembers;
    newMembersInPeriod;
    visitorsInPeriod;
    lastMonth;
};
exports.MemberStatistics = MemberStatistics;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], MemberStatistics.prototype, "totalMembers", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], MemberStatistics.prototype, "activeMembers", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], MemberStatistics.prototype, "inactiveMembers", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], MemberStatistics.prototype, "newMembersInPeriod", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], MemberStatistics.prototype, "visitorsInPeriod", void 0);
__decorate([
    (0, graphql_1.Field)(() => MemberStatisticsPeriod, { nullable: true }),
    __metadata("design:type", MemberStatisticsPeriod)
], MemberStatistics.prototype, "lastMonth", void 0);
exports.MemberStatistics = MemberStatistics = __decorate([
    (0, graphql_1.ObjectType)()
], MemberStatistics);
//# sourceMappingURL=member-statistics.output.js.map