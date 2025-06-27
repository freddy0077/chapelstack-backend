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
exports.Branch = void 0;
const graphql_1 = require("@nestjs/graphql");
const branch_setting_entity_1 = require("./branch-setting.entity");
let Branch = class Branch {
    id;
    name;
    address;
    city;
    state;
    postalCode;
    country;
    phoneNumber;
    email;
    website;
    establishedAt;
    isActive;
    createdAt;
    updatedAt;
    settings;
};
exports.Branch = Branch;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], Branch.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], Branch.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], Branch.prototype, "address", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], Branch.prototype, "city", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], Branch.prototype, "state", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], Branch.prototype, "postalCode", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], Branch.prototype, "country", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], Branch.prototype, "phoneNumber", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], Branch.prototype, "email", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], Branch.prototype, "website", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.GraphQLISODateTime, { nullable: true }),
    __metadata("design:type", Object)
], Branch.prototype, "establishedAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => Boolean),
    __metadata("design:type", Boolean)
], Branch.prototype, "isActive", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.GraphQLISODateTime),
    __metadata("design:type", Date)
], Branch.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.GraphQLISODateTime),
    __metadata("design:type", Date)
], Branch.prototype, "updatedAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => [branch_setting_entity_1.BranchSetting], {
        nullable: 'itemsAndList',
        description: 'Settings associated with this branch',
    }),
    __metadata("design:type", Object)
], Branch.prototype, "settings", void 0);
exports.Branch = Branch = __decorate([
    (0, graphql_1.ObjectType)()
], Branch);
//# sourceMappingURL=branch.entity.js.map