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
exports.ChildrenEvent = void 0;
const graphql_1 = require("@nestjs/graphql");
const graphql_2 = require("@nestjs/graphql");
let ChildrenEvent = class ChildrenEvent {
    id;
    name;
    description;
    startDateTime;
    endDateTime;
    location;
    ageRange;
    capacity;
    volunteersNeeded;
    branchId;
    createdAt;
    updatedAt;
    checkInRecords;
    volunteerAssignments;
};
exports.ChildrenEvent = ChildrenEvent;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], ChildrenEvent.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], ChildrenEvent.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], ChildrenEvent.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_2.GraphQLISODateTime),
    __metadata("design:type", Date)
], ChildrenEvent.prototype, "startDateTime", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_2.GraphQLISODateTime),
    __metadata("design:type", Date)
], ChildrenEvent.prototype, "endDateTime", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], ChildrenEvent.prototype, "location", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], ChildrenEvent.prototype, "ageRange", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Object)
], ChildrenEvent.prototype, "capacity", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Object)
], ChildrenEvent.prototype, "volunteersNeeded", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], ChildrenEvent.prototype, "branchId", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_2.GraphQLISODateTime),
    __metadata("design:type", Date)
], ChildrenEvent.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_2.GraphQLISODateTime),
    __metadata("design:type", Date)
], ChildrenEvent.prototype, "updatedAt", void 0);
exports.ChildrenEvent = ChildrenEvent = __decorate([
    (0, graphql_1.ObjectType)()
], ChildrenEvent);
//# sourceMappingURL=children-event.entity.js.map