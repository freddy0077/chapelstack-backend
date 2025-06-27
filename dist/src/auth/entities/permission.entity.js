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
exports.Permission = void 0;
const graphql_1 = require("@nestjs/graphql");
const role_entity_1 = require("./role.entity");
let Permission = class Permission {
    id;
    action;
    subject;
    description;
    roles;
    createdAt;
    updatedAt;
};
exports.Permission = Permission;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], Permission.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Permission.prototype, "action", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Permission.prototype, "subject", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], Permission.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => [role_entity_1.Role], { nullable: 'itemsAndList' }),
    __metadata("design:type", Array)
], Permission.prototype, "roles", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.GraphQLISODateTime),
    __metadata("design:type", Date)
], Permission.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.GraphQLISODateTime),
    __metadata("design:type", Date)
], Permission.prototype, "updatedAt", void 0);
exports.Permission = Permission = __decorate([
    (0, graphql_1.ObjectType)()
], Permission);
//# sourceMappingURL=permission.entity.js.map