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
exports.Guardian = void 0;
const graphql_1 = require("@nestjs/graphql");
const graphql_2 = require("@nestjs/graphql");
let Guardian = class Guardian {
    id;
    memberId;
    firstName;
    lastName;
    relationship;
    isPrimaryGuardian;
    canPickup;
    phone;
    email;
    address;
    notes;
    branchId;
    createdAt;
    updatedAt;
    childRelations;
    checkInsPerformed;
    checkOutsPerformed;
    fullName;
};
exports.Guardian = Guardian;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], Guardian.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], Guardian.prototype, "memberId", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], Guardian.prototype, "firstName", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], Guardian.prototype, "lastName", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], Guardian.prototype, "relationship", void 0);
__decorate([
    (0, graphql_1.Field)(() => Boolean),
    __metadata("design:type", Boolean)
], Guardian.prototype, "isPrimaryGuardian", void 0);
__decorate([
    (0, graphql_1.Field)(() => Boolean),
    __metadata("design:type", Boolean)
], Guardian.prototype, "canPickup", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], Guardian.prototype, "phone", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], Guardian.prototype, "email", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], Guardian.prototype, "address", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], Guardian.prototype, "notes", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], Guardian.prototype, "branchId", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_2.GraphQLISODateTime),
    __metadata("design:type", Date)
], Guardian.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_2.GraphQLISODateTime),
    __metadata("design:type", Date)
], Guardian.prototype, "updatedAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], Guardian.prototype, "fullName", void 0);
exports.Guardian = Guardian = __decorate([
    (0, graphql_1.ObjectType)()
], Guardian);
//# sourceMappingURL=guardian.entity.js.map