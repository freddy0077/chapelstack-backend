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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentMethodResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const payment_method_entity_1 = require("./payment-method.entity");
const prisma_service_1 = require("../prisma/prisma.service");
let PaymentMethodResolver = class PaymentMethodResolver {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    paymentMethods(organisationId) {
        return this.prisma.paymentMethod.findMany({ where: { organisationId } });
    }
};
exports.PaymentMethodResolver = PaymentMethodResolver;
__decorate([
    (0, graphql_1.Query)(() => [payment_method_entity_1.PaymentMethod]),
    __param(0, (0, graphql_1.Args)('organisationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentMethodResolver.prototype, "paymentMethods", null);
exports.PaymentMethodResolver = PaymentMethodResolver = __decorate([
    (0, graphql_1.Resolver)(() => payment_method_entity_1.PaymentMethod),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PaymentMethodResolver);
//# sourceMappingURL=payment-method.resolver.js.map