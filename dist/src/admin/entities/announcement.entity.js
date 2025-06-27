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
exports.Announcement = void 0;
const graphql_1 = require("@nestjs/graphql");
let Announcement = class Announcement {
    id;
    key;
    title;
    content;
    startDate;
    endDate;
    targetRoleIds;
    targetBranchIds;
    isActive;
};
exports.Announcement = Announcement;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], Announcement.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Announcement.prototype, "key", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Announcement.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Announcement.prototype, "content", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.GraphQLISODateTime),
    __metadata("design:type", Date)
], Announcement.prototype, "startDate", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.GraphQLISODateTime),
    __metadata("design:type", Date)
], Announcement.prototype, "endDate", void 0);
__decorate([
    (0, graphql_1.Field)(() => [graphql_1.ID], { nullable: true }),
    __metadata("design:type", Array)
], Announcement.prototype, "targetRoleIds", void 0);
__decorate([
    (0, graphql_1.Field)(() => [graphql_1.ID], { nullable: true }),
    __metadata("design:type", Array)
], Announcement.prototype, "targetBranchIds", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], Announcement.prototype, "isActive", void 0);
exports.Announcement = Announcement = __decorate([
    (0, graphql_1.ObjectType)()
], Announcement);
//# sourceMappingURL=announcement.entity.js.map