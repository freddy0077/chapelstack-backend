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
exports.License = exports.LicenseType = exports.LicenseStatus = void 0;
const graphql_1 = require("@nestjs/graphql");
const graphql_type_json_1 = require("graphql-type-json");
var LicenseStatus;
(function (LicenseStatus) {
    LicenseStatus["ACTIVE"] = "ACTIVE";
    LicenseStatus["EXPIRED"] = "EXPIRED";
    LicenseStatus["PENDING"] = "PENDING";
    LicenseStatus["CANCELLED"] = "CANCELLED";
})(LicenseStatus || (exports.LicenseStatus = LicenseStatus = {}));
var LicenseType;
(function (LicenseType) {
    LicenseType["BASIC"] = "BASIC";
    LicenseType["STANDARD"] = "STANDARD";
    LicenseType["PREMIUM"] = "PREMIUM";
    LicenseType["ENTERPRISE"] = "ENTERPRISE";
})(LicenseType || (exports.LicenseType = LicenseType = {}));
(0, graphql_1.registerEnumType)(LicenseStatus, {
    name: 'LicenseStatus',
    description: 'Status of a license',
});
(0, graphql_1.registerEnumType)(LicenseType, {
    name: 'LicenseType',
    description: 'Type of license',
});
let License = class License {
    id;
    key;
    type;
    status;
    startDate;
    expiryDate;
    organizationName;
    contactEmail;
    contactPhone;
    features;
    maxUsers;
    maxBranches;
    notes;
    createdAt;
    updatedAt;
};
exports.License = License;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], License.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], License.prototype, "key", void 0);
__decorate([
    (0, graphql_1.Field)(() => LicenseType),
    __metadata("design:type", String)
], License.prototype, "type", void 0);
__decorate([
    (0, graphql_1.Field)(() => LicenseStatus),
    __metadata("design:type", String)
], License.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.GraphQLISODateTime),
    __metadata("design:type", Date)
], License.prototype, "startDate", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.GraphQLISODateTime),
    __metadata("design:type", Date)
], License.prototype, "expiryDate", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], License.prototype, "organizationName", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], License.prototype, "contactEmail", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], License.prototype, "contactPhone", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSON, { nullable: true }),
    __metadata("design:type", Object)
], License.prototype, "features", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Number)
], License.prototype, "maxUsers", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Number)
], License.prototype, "maxBranches", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], License.prototype, "notes", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.GraphQLISODateTime),
    __metadata("design:type", Date)
], License.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.GraphQLISODateTime),
    __metadata("design:type", Date)
], License.prototype, "updatedAt", void 0);
exports.License = License = __decorate([
    (0, graphql_1.ObjectType)()
], License);
//# sourceMappingURL=license.entity.js.map