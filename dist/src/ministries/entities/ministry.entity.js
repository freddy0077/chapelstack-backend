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
exports.Ministry = void 0;
const graphql_1 = require("@nestjs/graphql");
const group_member_entity_1 = require("./group-member.entity");
const small_group_entity_1 = require("./small-group.entity");
let Ministry = class Ministry {
    id;
    name;
    description;
    type;
    status;
    branchId;
    organisationId;
    parentId;
    createdAt;
    updatedAt;
    members;
    smallGroups;
    subMinistries;
    parent;
};
exports.Ministry = Ministry;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], Ministry.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Ministry.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], Ministry.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Ministry.prototype, "type", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Ministry.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID, { nullable: true }),
    __metadata("design:type", Object)
], Ministry.prototype, "branchId", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID, { nullable: true }),
    __metadata("design:type", Object)
], Ministry.prototype, "organisationId", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID, { nullable: true }),
    __metadata("design:type", Object)
], Ministry.prototype, "parentId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], Ministry.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], Ministry.prototype, "updatedAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => [group_member_entity_1.GroupMember], { nullable: true }),
    __metadata("design:type", Object)
], Ministry.prototype, "members", void 0);
__decorate([
    (0, graphql_1.Field)(() => [small_group_entity_1.SmallGroup], { nullable: true }),
    __metadata("design:type", Object)
], Ministry.prototype, "smallGroups", void 0);
__decorate([
    (0, graphql_1.Field)(() => [Ministry], { nullable: true }),
    __metadata("design:type", Object)
], Ministry.prototype, "subMinistries", void 0);
__decorate([
    (0, graphql_1.Field)(() => Ministry, { nullable: true }),
    __metadata("design:type", Object)
], Ministry.prototype, "parent", void 0);
exports.Ministry = Ministry = __decorate([
    (0, graphql_1.ObjectType)()
], Ministry);
//# sourceMappingURL=ministry.entity.js.map