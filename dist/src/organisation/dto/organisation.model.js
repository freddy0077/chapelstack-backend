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
exports.Organisation = void 0;
const graphql_1 = require("@nestjs/graphql");
let Organisation = class Organisation {
    id;
    name;
    email;
    phoneNumber;
    website;
    address;
    city;
    state;
    country;
    zipCode;
    denomination;
    foundingYear;
    size;
    vision;
    missionStatement;
    description;
    timezone;
    currency;
    primaryColor;
    secondaryColor;
    accentColor;
    logoUrl;
    faviconUrl;
    slogan;
    brandFont;
    socialHandle;
    createdAt;
    updatedAt;
};
exports.Organisation = Organisation;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], Organisation.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Organisation.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], Organisation.prototype, "email", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], Organisation.prototype, "phoneNumber", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], Organisation.prototype, "website", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], Organisation.prototype, "address", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], Organisation.prototype, "city", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], Organisation.prototype, "state", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], Organisation.prototype, "country", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], Organisation.prototype, "zipCode", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], Organisation.prototype, "denomination", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Number)
], Organisation.prototype, "foundingYear", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], Organisation.prototype, "size", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], Organisation.prototype, "vision", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], Organisation.prototype, "missionStatement", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], Organisation.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], Organisation.prototype, "timezone", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], Organisation.prototype, "currency", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Organisation.prototype, "primaryColor", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Organisation.prototype, "secondaryColor", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], Organisation.prototype, "accentColor", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], Organisation.prototype, "logoUrl", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], Organisation.prototype, "faviconUrl", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], Organisation.prototype, "slogan", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], Organisation.prototype, "brandFont", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], Organisation.prototype, "socialHandle", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], Organisation.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], Organisation.prototype, "updatedAt", void 0);
exports.Organisation = Organisation = __decorate([
    (0, graphql_1.ObjectType)()
], Organisation);
//# sourceMappingURL=organisation.model.js.map