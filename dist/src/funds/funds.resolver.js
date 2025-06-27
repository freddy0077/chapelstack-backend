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
exports.FundsResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const funds_service_1 = require("./funds.service");
const fund_entity_1 = require("./entities/fund.entity");
const create_fund_input_1 = require("./dto/create-fund.input");
const update_fund_input_1 = require("./dto/update-fund.input");
let FundsResolver = class FundsResolver {
    fundsService;
    constructor(fundsService) {
        this.fundsService = fundsService;
    }
    createFund(createFundInput) {
        return this.fundsService.create(createFundInput);
    }
    findAll(organisationId) {
        return this.fundsService.findAll(organisationId);
    }
    findOne(id) {
        return this.fundsService.findOne(id);
    }
    updateFund(updateFundInput) {
        return this.fundsService.update(updateFundInput.id, updateFundInput);
    }
    removeFund(id) {
        return this.fundsService.remove(id);
    }
};
exports.FundsResolver = FundsResolver;
__decorate([
    (0, graphql_1.Mutation)(() => fund_entity_1.Fund),
    __param(0, (0, graphql_1.Args)('createFundInput')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_fund_input_1.CreateFundInput]),
    __metadata("design:returntype", void 0)
], FundsResolver.prototype, "createFund", null);
__decorate([
    (0, graphql_1.Query)(() => [fund_entity_1.Fund], { name: 'funds' }),
    __param(0, (0, graphql_1.Args)('organisationId', { type: () => String, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FundsResolver.prototype, "findAll", null);
__decorate([
    (0, graphql_1.Query)(() => fund_entity_1.Fund, { name: 'fund' }),
    __param(0, (0, graphql_1.Args)('id', { type: () => String })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FundsResolver.prototype, "findOne", null);
__decorate([
    (0, graphql_1.Mutation)(() => fund_entity_1.Fund),
    __param(0, (0, graphql_1.Args)('updateFundInput')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_fund_input_1.UpdateFundInput]),
    __metadata("design:returntype", void 0)
], FundsResolver.prototype, "updateFund", null);
__decorate([
    (0, graphql_1.Mutation)(() => fund_entity_1.Fund),
    __param(0, (0, graphql_1.Args)('id', { type: () => String })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FundsResolver.prototype, "removeFund", null);
exports.FundsResolver = FundsResolver = __decorate([
    (0, graphql_1.Resolver)(() => fund_entity_1.Fund),
    __metadata("design:paramtypes", [funds_service_1.FundsService])
], FundsResolver);
//# sourceMappingURL=funds.resolver.js.map