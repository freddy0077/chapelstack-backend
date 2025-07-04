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
exports.SmallGroup = void 0;
const graphql_1 = require("@nestjs/graphql");
const group_member_entity_1 = require("./group-member.entity");
const ministry_entity_1 = require("./ministry.entity");
let SmallGroup = class SmallGroup {
    id;
    name;
    description;
    type;
    meetingSchedule;
    location;
    maximumCapacity;
    status;
    branchId;
    organisationId;
    ministryId;
    createdAt;
    updatedAt;
    members;
    ministry;
};
exports.SmallGroup = SmallGroup;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], SmallGroup.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], SmallGroup.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], SmallGroup.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], SmallGroup.prototype, "type", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], SmallGroup.prototype, "meetingSchedule", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], SmallGroup.prototype, "location", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Object)
], SmallGroup.prototype, "maximumCapacity", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], SmallGroup.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], SmallGroup.prototype, "branchId", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], SmallGroup.prototype, "organisationId", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], SmallGroup.prototype, "ministryId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], SmallGroup.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], SmallGroup.prototype, "updatedAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => [group_member_entity_1.GroupMember], { nullable: true }),
    __metadata("design:type", Object)
], SmallGroup.prototype, "members", void 0);
__decorate([
    (0, graphql_1.Field)(() => ministry_entity_1.Ministry, { nullable: true }),
    __metadata("design:type", Object)
], SmallGroup.prototype, "ministry", void 0);
exports.SmallGroup = SmallGroup = __decorate([
    (0, graphql_1.ObjectType)()
], SmallGroup);
//# sourceMappingURL=small-group.entity.js.map