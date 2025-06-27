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
exports.SacramentalRecord = exports.SacramentTypeEnum = void 0;
const graphql_1 = require("@nestjs/graphql");
const client_1 = require("@prisma/client");
var SacramentTypeEnum;
(function (SacramentTypeEnum) {
    SacramentTypeEnum["BAPTISM"] = "BAPTISM";
    SacramentTypeEnum["EUCHARIST_FIRST_COMMUNION"] = "EUCHARIST_FIRST_COMMUNION";
    SacramentTypeEnum["CONFIRMATION"] = "CONFIRMATION";
    SacramentTypeEnum["RECONCILIATION_FIRST"] = "RECONCILIATION_FIRST";
    SacramentTypeEnum["ANOINTING_OF_THE_SICK"] = "ANOINTING_OF_THE_SICK";
    SacramentTypeEnum["HOLY_ORDERS_DIACONATE"] = "HOLY_ORDERS_DIACONATE";
    SacramentTypeEnum["HOLY_ORDERS_PRIESTHOOD"] = "HOLY_ORDERS_PRIESTHOOD";
    SacramentTypeEnum["MATRIMONY"] = "MATRIMONY";
    SacramentTypeEnum["RCIA_INITIATION"] = "RCIA_INITIATION";
    SacramentTypeEnum["OTHER"] = "OTHER";
})(SacramentTypeEnum || (exports.SacramentTypeEnum = SacramentTypeEnum = {}));
(0, graphql_1.registerEnumType)(SacramentTypeEnum, {
    name: 'SacramentType',
    description: 'Types of sacraments administered in the church',
});
let SacramentalRecord = class SacramentalRecord {
    id;
    memberId;
    sacramentType;
    dateOfSacrament;
    locationOfSacrament;
    officiantName;
    officiantId;
    godparent1Name;
    godparent2Name;
    sponsorName;
    witness1Name;
    witness2Name;
    certificateNumber;
    certificateUrl;
    notes;
    branchId;
    organisationId;
    createdAt;
    updatedAt;
};
exports.SacramentalRecord = SacramentalRecord;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], SacramentalRecord.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], SacramentalRecord.prototype, "memberId", void 0);
__decorate([
    (0, graphql_1.Field)(() => SacramentTypeEnum),
    __metadata("design:type", String)
], SacramentalRecord.prototype, "sacramentType", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date),
    __metadata("design:type", Date)
], SacramentalRecord.prototype, "dateOfSacrament", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], SacramentalRecord.prototype, "locationOfSacrament", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], SacramentalRecord.prototype, "officiantName", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], SacramentalRecord.prototype, "officiantId", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], SacramentalRecord.prototype, "godparent1Name", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], SacramentalRecord.prototype, "godparent2Name", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], SacramentalRecord.prototype, "sponsorName", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], SacramentalRecord.prototype, "witness1Name", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], SacramentalRecord.prototype, "witness2Name", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], SacramentalRecord.prototype, "certificateNumber", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], SacramentalRecord.prototype, "certificateUrl", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], SacramentalRecord.prototype, "notes", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], SacramentalRecord.prototype, "branchId", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], SacramentalRecord.prototype, "organisationId", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date),
    __metadata("design:type", Date)
], SacramentalRecord.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date),
    __metadata("design:type", Date)
], SacramentalRecord.prototype, "updatedAt", void 0);
exports.SacramentalRecord = SacramentalRecord = __decorate([
    (0, graphql_1.ObjectType)()
], SacramentalRecord);
//# sourceMappingURL=sacramental-record.entity.js.map