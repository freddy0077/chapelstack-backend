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
exports.SeriesEntity = void 0;
const graphql_1 = require("@nestjs/graphql");
let SeriesEntity = class SeriesEntity {
    id;
    title;
    description;
    imageUrl;
    startDate;
    endDate;
    isActive;
    branchId;
    createdAt;
    updatedAt;
};
exports.SeriesEntity = SeriesEntity;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], SeriesEntity.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], SeriesEntity.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], SeriesEntity.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], SeriesEntity.prototype, "imageUrl", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], SeriesEntity.prototype, "startDate", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], SeriesEntity.prototype, "endDate", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], SeriesEntity.prototype, "isActive", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], SeriesEntity.prototype, "branchId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], SeriesEntity.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], SeriesEntity.prototype, "updatedAt", void 0);
exports.SeriesEntity = SeriesEntity = __decorate([
    (0, graphql_1.ObjectType)('Series')
], SeriesEntity);
//# sourceMappingURL=series.entity.js.map