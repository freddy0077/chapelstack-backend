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
exports.PaginatedUsers = void 0;
const graphql_1 = require("@nestjs/graphql");
const user_entity_1 = require("../../auth/entities/user.entity");
let PaginatedUsers = class PaginatedUsers {
    items;
    totalCount;
    hasNextPage;
};
exports.PaginatedUsers = PaginatedUsers;
__decorate([
    (0, graphql_1.Field)(() => [user_entity_1.User]),
    __metadata("design:type", Array)
], PaginatedUsers.prototype, "items", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], PaginatedUsers.prototype, "totalCount", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], PaginatedUsers.prototype, "hasNextPage", void 0);
exports.PaginatedUsers = PaginatedUsers = __decorate([
    (0, graphql_1.ObjectType)()
], PaginatedUsers);
//# sourceMappingURL=paginated-users.entity.js.map