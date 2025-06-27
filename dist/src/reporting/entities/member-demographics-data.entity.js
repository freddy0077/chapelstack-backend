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
exports.MemberDemographicsData = exports.MembershipStatusDistribution = exports.GenderDistribution = exports.AgeDistribution = void 0;
const graphql_1 = require("@nestjs/graphql");
let AgeDistribution = class AgeDistribution {
    ageGroup;
    count;
    percentage;
};
exports.AgeDistribution = AgeDistribution;
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], AgeDistribution.prototype, "ageGroup", void 0);
__decorate([
    (0, graphql_1.Field)(() => Number),
    __metadata("design:type", Number)
], AgeDistribution.prototype, "count", void 0);
__decorate([
    (0, graphql_1.Field)(() => Number),
    __metadata("design:type", Number)
], AgeDistribution.prototype, "percentage", void 0);
exports.AgeDistribution = AgeDistribution = __decorate([
    (0, graphql_1.ObjectType)()
], AgeDistribution);
let GenderDistribution = class GenderDistribution {
    maleCount;
    femaleCount;
    otherCount;
    malePercentage;
    femalePercentage;
    otherPercentage;
};
exports.GenderDistribution = GenderDistribution;
__decorate([
    (0, graphql_1.Field)(() => Number),
    __metadata("design:type", Number)
], GenderDistribution.prototype, "maleCount", void 0);
__decorate([
    (0, graphql_1.Field)(() => Number),
    __metadata("design:type", Number)
], GenderDistribution.prototype, "femaleCount", void 0);
__decorate([
    (0, graphql_1.Field)(() => Number),
    __metadata("design:type", Number)
], GenderDistribution.prototype, "otherCount", void 0);
__decorate([
    (0, graphql_1.Field)(() => Number),
    __metadata("design:type", Number)
], GenderDistribution.prototype, "malePercentage", void 0);
__decorate([
    (0, graphql_1.Field)(() => Number),
    __metadata("design:type", Number)
], GenderDistribution.prototype, "femalePercentage", void 0);
__decorate([
    (0, graphql_1.Field)(() => Number),
    __metadata("design:type", Number)
], GenderDistribution.prototype, "otherPercentage", void 0);
exports.GenderDistribution = GenderDistribution = __decorate([
    (0, graphql_1.ObjectType)()
], GenderDistribution);
let MembershipStatusDistribution = class MembershipStatusDistribution {
    status;
    count;
    percentage;
};
exports.MembershipStatusDistribution = MembershipStatusDistribution;
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], MembershipStatusDistribution.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)(() => Number),
    __metadata("design:type", Number)
], MembershipStatusDistribution.prototype, "count", void 0);
__decorate([
    (0, graphql_1.Field)(() => Number),
    __metadata("design:type", Number)
], MembershipStatusDistribution.prototype, "percentage", void 0);
exports.MembershipStatusDistribution = MembershipStatusDistribution = __decorate([
    (0, graphql_1.ObjectType)()
], MembershipStatusDistribution);
let MemberDemographicsData = class MemberDemographicsData {
    branchId;
    organisationId;
    branchName;
    startDate;
    endDate;
    totalMembers;
    newMembersInPeriod;
    ageDistribution;
    genderDistribution;
    membershipStatusDistribution;
};
exports.MemberDemographicsData = MemberDemographicsData;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID, { nullable: true }),
    __metadata("design:type", String)
], MemberDemographicsData.prototype, "branchId", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID, { nullable: true }),
    __metadata("design:type", String)
], MemberDemographicsData.prototype, "organisationId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], MemberDemographicsData.prototype, "branchName", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date),
    __metadata("design:type", Date)
], MemberDemographicsData.prototype, "startDate", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date),
    __metadata("design:type", Date)
], MemberDemographicsData.prototype, "endDate", void 0);
__decorate([
    (0, graphql_1.Field)(() => Number),
    __metadata("design:type", Number)
], MemberDemographicsData.prototype, "totalMembers", void 0);
__decorate([
    (0, graphql_1.Field)(() => Number),
    __metadata("design:type", Number)
], MemberDemographicsData.prototype, "newMembersInPeriod", void 0);
__decorate([
    (0, graphql_1.Field)(() => [AgeDistribution]),
    __metadata("design:type", Array)
], MemberDemographicsData.prototype, "ageDistribution", void 0);
__decorate([
    (0, graphql_1.Field)(() => GenderDistribution),
    __metadata("design:type", GenderDistribution)
], MemberDemographicsData.prototype, "genderDistribution", void 0);
__decorate([
    (0, graphql_1.Field)(() => [MembershipStatusDistribution]),
    __metadata("design:type", Array)
], MemberDemographicsData.prototype, "membershipStatusDistribution", void 0);
exports.MemberDemographicsData = MemberDemographicsData = __decorate([
    (0, graphql_1.ObjectType)()
], MemberDemographicsData);
//# sourceMappingURL=member-demographics-data.entity.js.map