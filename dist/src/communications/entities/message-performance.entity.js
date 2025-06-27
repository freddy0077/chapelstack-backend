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
exports.MessagePerformanceEntity = exports.MessagePerformanceMetrics = void 0;
const graphql_1 = require("@nestjs/graphql");
let MessagePerformanceMetrics = class MessagePerformanceMetrics {
    templateName;
    totalSent;
    delivered;
    deliveryRate;
    opened;
    openRate;
    clickRate;
    responseRate;
    averageResponseTime;
};
exports.MessagePerformanceMetrics = MessagePerformanceMetrics;
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], MessagePerformanceMetrics.prototype, "templateName", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], MessagePerformanceMetrics.prototype, "totalSent", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], MessagePerformanceMetrics.prototype, "delivered", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], MessagePerformanceMetrics.prototype, "deliveryRate", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], MessagePerformanceMetrics.prototype, "opened", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata("design:type", Number)
], MessagePerformanceMetrics.prototype, "openRate", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata("design:type", Number)
], MessagePerformanceMetrics.prototype, "clickRate", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata("design:type", Number)
], MessagePerformanceMetrics.prototype, "responseRate", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], MessagePerformanceMetrics.prototype, "averageResponseTime", void 0);
exports.MessagePerformanceMetrics = MessagePerformanceMetrics = __decorate([
    (0, graphql_1.ObjectType)()
], MessagePerformanceMetrics);
let MessagePerformanceEntity = class MessagePerformanceEntity {
    templates;
    overallDeliveryRate;
    overallOpenRate;
    overallResponseRate;
};
exports.MessagePerformanceEntity = MessagePerformanceEntity;
__decorate([
    (0, graphql_1.Field)(() => [MessagePerformanceMetrics]),
    __metadata("design:type", Array)
], MessagePerformanceEntity.prototype, "templates", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], MessagePerformanceEntity.prototype, "overallDeliveryRate", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata("design:type", Number)
], MessagePerformanceEntity.prototype, "overallOpenRate", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata("design:type", Number)
], MessagePerformanceEntity.prototype, "overallResponseRate", void 0);
exports.MessagePerformanceEntity = MessagePerformanceEntity = __decorate([
    (0, graphql_1.ObjectType)()
], MessagePerformanceEntity);
//# sourceMappingURL=message-performance.entity.js.map