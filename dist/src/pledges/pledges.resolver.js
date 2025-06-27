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
exports.PledgesResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const pledges_service_1 = require("./pledges.service");
const pledge_entity_1 = require("./entities/pledge.entity");
const create_pledge_input_1 = require("./dto/create-pledge.input");
const update_pledge_input_1 = require("./dto/update-pledge.input");
let PledgesResolver = class PledgesResolver {
    pledgesService;
    constructor(pledgesService) {
        this.pledgesService = pledgesService;
    }
    createPledge(createPledgeInput) {
        return this.pledgesService.create(createPledgeInput);
    }
    findAll(organisationId) {
        return this.pledgesService.findAll(organisationId);
    }
    findOne(id) {
        return this.pledgesService.findOne(id);
    }
    updatePledge(updatePledgeInput) {
        return this.pledgesService.update(updatePledgeInput.id, updatePledgeInput);
    }
    removePledge(id) {
        return this.pledgesService.remove(id);
    }
};
exports.PledgesResolver = PledgesResolver;
__decorate([
    (0, graphql_1.Mutation)(() => pledge_entity_1.Pledge),
    __param(0, (0, graphql_1.Args)('createPledgeInput')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_pledge_input_1.CreatePledgeInput]),
    __metadata("design:returntype", void 0)
], PledgesResolver.prototype, "createPledge", null);
__decorate([
    (0, graphql_1.Query)(() => [pledge_entity_1.Pledge], { name: 'pledges' }),
    __param(0, (0, graphql_1.Args)('organisationId', { type: () => String, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PledgesResolver.prototype, "findAll", null);
__decorate([
    (0, graphql_1.Query)(() => pledge_entity_1.Pledge, { name: 'pledge' }),
    __param(0, (0, graphql_1.Args)('id', { type: () => String })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PledgesResolver.prototype, "findOne", null);
__decorate([
    (0, graphql_1.Mutation)(() => pledge_entity_1.Pledge),
    __param(0, (0, graphql_1.Args)('updatePledgeInput')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_pledge_input_1.UpdatePledgeInput]),
    __metadata("design:returntype", void 0)
], PledgesResolver.prototype, "updatePledge", null);
__decorate([
    (0, graphql_1.Mutation)(() => pledge_entity_1.Pledge),
    __param(0, (0, graphql_1.Args)('id', { type: () => String })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PledgesResolver.prototype, "removePledge", null);
exports.PledgesResolver = PledgesResolver = __decorate([
    (0, graphql_1.Resolver)(() => pledge_entity_1.Pledge),
    __metadata("design:paramtypes", [pledges_service_1.PledgesService])
], PledgesResolver);
//# sourceMappingURL=pledges.resolver.js.map