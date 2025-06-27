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
exports.Contribution = void 0;
const graphql_1 = require("@nestjs/graphql");
const contribution_type_entity_1 = require("../../contribution-types/contribution-type.entity");
const fund_entity_1 = require("../../funds/entities/fund.entity");
const member_entity_1 = require("../../members/entities/member.entity");
const payment_method_entity_1 = require("../../payment-methods/payment-method.entity");
let Contribution = class Contribution {
    id;
    amount;
    date;
    contributionTypeId;
    contributionType;
    paymentMethodId;
    paymentMethod;
    notes;
    memberId;
    member;
    anonymous;
    fundId;
    fund;
    pledgeId;
    branchId;
    organisationId;
};
exports.Contribution = Contribution;
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], Contribution.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], Contribution.prototype, "amount", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date),
    __metadata("design:type", Date)
], Contribution.prototype, "date", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], Contribution.prototype, "contributionTypeId", void 0);
__decorate([
    (0, graphql_1.Field)(() => contribution_type_entity_1.ContributionType, { nullable: true }),
    __metadata("design:type", contribution_type_entity_1.ContributionType)
], Contribution.prototype, "contributionType", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], Contribution.prototype, "paymentMethodId", void 0);
__decorate([
    (0, graphql_1.Field)(() => payment_method_entity_1.PaymentMethod, { nullable: true }),
    __metadata("design:type", payment_method_entity_1.PaymentMethod)
], Contribution.prototype, "paymentMethod", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], Contribution.prototype, "notes", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], Contribution.prototype, "memberId", void 0);
__decorate([
    (0, graphql_1.Field)(() => member_entity_1.Member, { nullable: true }),
    __metadata("design:type", member_entity_1.Member)
], Contribution.prototype, "member", void 0);
__decorate([
    (0, graphql_1.Field)(() => Boolean, { nullable: true }),
    __metadata("design:type", Boolean)
], Contribution.prototype, "anonymous", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], Contribution.prototype, "fundId", void 0);
__decorate([
    (0, graphql_1.Field)(() => fund_entity_1.Fund, { nullable: true }),
    __metadata("design:type", fund_entity_1.Fund)
], Contribution.prototype, "fund", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], Contribution.prototype, "pledgeId", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], Contribution.prototype, "branchId", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], Contribution.prototype, "organisationId", void 0);
exports.Contribution = Contribution = __decorate([
    (0, graphql_1.ObjectType)()
], Contribution);
//# sourceMappingURL=contribution.entity.js.map