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
exports.ChildrenMinistryVolunteer = void 0;
const graphql_1 = require("@nestjs/graphql");
const graphql_2 = require("@nestjs/graphql");
let ChildrenMinistryVolunteer = class ChildrenMinistryVolunteer {
    id;
    memberId;
    role;
    backgroundCheckDate;
    backgroundCheckStatus;
    trainingCompletionDate;
    isActive;
    notes;
    branchId;
    createdAt;
    updatedAt;
    eventAssignments;
};
exports.ChildrenMinistryVolunteer = ChildrenMinistryVolunteer;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], ChildrenMinistryVolunteer.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], ChildrenMinistryVolunteer.prototype, "memberId", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], ChildrenMinistryVolunteer.prototype, "role", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_2.GraphQLISODateTime, { nullable: true }),
    __metadata("design:type", Object)
], ChildrenMinistryVolunteer.prototype, "backgroundCheckDate", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], ChildrenMinistryVolunteer.prototype, "backgroundCheckStatus", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_2.GraphQLISODateTime, { nullable: true }),
    __metadata("design:type", Object)
], ChildrenMinistryVolunteer.prototype, "trainingCompletionDate", void 0);
__decorate([
    (0, graphql_1.Field)(() => Boolean),
    __metadata("design:type", Boolean)
], ChildrenMinistryVolunteer.prototype, "isActive", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], ChildrenMinistryVolunteer.prototype, "notes", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], ChildrenMinistryVolunteer.prototype, "branchId", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_2.GraphQLISODateTime),
    __metadata("design:type", Date)
], ChildrenMinistryVolunteer.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_2.GraphQLISODateTime),
    __metadata("design:type", Date)
], ChildrenMinistryVolunteer.prototype, "updatedAt", void 0);
exports.ChildrenMinistryVolunteer = ChildrenMinistryVolunteer = __decorate([
    (0, graphql_1.ObjectType)()
], ChildrenMinistryVolunteer);
//# sourceMappingURL=children-ministry-volunteer.entity.js.map