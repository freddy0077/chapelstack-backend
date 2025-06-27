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
exports.BranchStatistics = void 0;
const graphql_1 = require("@nestjs/graphql");
let BranchStatistics = class BranchStatistics {
    totalMembers;
    activeMembers;
    inactiveMembers;
    newMembersInPeriod;
    lastMonth;
};
exports.BranchStatistics = BranchStatistics;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { description: 'Total number of members in this branch.' }),
    __metadata("design:type", Number)
], BranchStatistics.prototype, "totalMembers", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { description: 'Number of active members in this branch.' }),
    __metadata("design:type", Number)
], BranchStatistics.prototype, "activeMembers", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, {
        description: 'Number of inactive members in this branch.',
    }),
    __metadata("design:type", Number)
], BranchStatistics.prototype, "inactiveMembers", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, {
        description: 'Number of new members who joined this branch in the relevant period (current or last month).',
    }),
    __metadata("design:type", Number)
], BranchStatistics.prototype, "newMembersInPeriod", void 0);
__decorate([
    (0, graphql_1.Field)(() => BranchStatistics, {
        nullable: true,
        description: 'Statistics for the previous month.',
    }),
    __metadata("design:type", BranchStatistics)
], BranchStatistics.prototype, "lastMonth", void 0);
exports.BranchStatistics = BranchStatistics = __decorate([
    (0, graphql_1.ObjectType)('BranchStatistics')
], BranchStatistics);
//# sourceMappingURL=branch-statistics.output.js.map