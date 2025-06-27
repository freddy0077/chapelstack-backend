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
exports.SpiritualMilestone = exports.MilestoneType = void 0;
const graphql_1 = require("@nestjs/graphql");
const graphql_2 = require("@nestjs/graphql");
const member_entity_1 = require("./member.entity");
const graphql_type_json_1 = require("graphql-type-json");
var MilestoneType;
(function (MilestoneType) {
    MilestoneType["BAPTISM"] = "BAPTISM";
    MilestoneType["FIRST_COMMUNION"] = "FIRST_COMMUNION";
    MilestoneType["CONFIRMATION"] = "CONFIRMATION";
    MilestoneType["MARRIAGE"] = "MARRIAGE";
    MilestoneType["DEDICATION"] = "DEDICATION";
    MilestoneType["ORDINATION"] = "ORDINATION";
    MilestoneType["OTHER"] = "OTHER";
})(MilestoneType || (exports.MilestoneType = MilestoneType = {}));
(0, graphql_1.registerEnumType)(MilestoneType, {
    name: 'MilestoneType',
    description: 'Type of spiritual milestone',
});
let SpiritualMilestone = class SpiritualMilestone {
    id;
    type;
    date;
    location;
    performedBy;
    description;
    additionalDetails;
    member;
    memberId;
    createdAt;
    updatedAt;
};
exports.SpiritualMilestone = SpiritualMilestone;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], SpiritualMilestone.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => MilestoneType),
    __metadata("design:type", String)
], SpiritualMilestone.prototype, "type", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_2.GraphQLISODateTime),
    __metadata("design:type", Date)
], SpiritualMilestone.prototype, "date", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], SpiritualMilestone.prototype, "location", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], SpiritualMilestone.prototype, "performedBy", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], SpiritualMilestone.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSON, { nullable: true }),
    __metadata("design:type", Object)
], SpiritualMilestone.prototype, "additionalDetails", void 0);
__decorate([
    (0, graphql_1.Field)(() => member_entity_1.Member),
    __metadata("design:type", member_entity_1.Member)
], SpiritualMilestone.prototype, "member", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], SpiritualMilestone.prototype, "memberId", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_2.GraphQLISODateTime),
    __metadata("design:type", Date)
], SpiritualMilestone.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_2.GraphQLISODateTime),
    __metadata("design:type", Date)
], SpiritualMilestone.prototype, "updatedAt", void 0);
exports.SpiritualMilestone = SpiritualMilestone = __decorate([
    (0, graphql_1.ObjectType)()
], SpiritualMilestone);
//# sourceMappingURL=spiritual-milestone.entity.js.map