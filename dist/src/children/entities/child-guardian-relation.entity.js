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
exports.ChildGuardianRelation = void 0;
const graphql_1 = require("@nestjs/graphql");
const graphql_2 = require("@nestjs/graphql");
let ChildGuardianRelation = class ChildGuardianRelation {
    id;
    childId;
    guardianId;
    relationship;
    createdAt;
    updatedAt;
    child;
    guardian;
};
exports.ChildGuardianRelation = ChildGuardianRelation;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], ChildGuardianRelation.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], ChildGuardianRelation.prototype, "childId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], ChildGuardianRelation.prototype, "guardianId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], ChildGuardianRelation.prototype, "relationship", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_2.GraphQLISODateTime),
    __metadata("design:type", Date)
], ChildGuardianRelation.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_2.GraphQLISODateTime),
    __metadata("design:type", Date)
], ChildGuardianRelation.prototype, "updatedAt", void 0);
exports.ChildGuardianRelation = ChildGuardianRelation = __decorate([
    (0, graphql_1.ObjectType)()
], ChildGuardianRelation);
//# sourceMappingURL=child-guardian-relation.entity.js.map