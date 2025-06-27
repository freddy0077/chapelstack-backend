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
exports.VendorsResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const vendors_service_1 = require("./vendors.service");
const vendor_entity_1 = require("./entities/vendor.entity");
const create_vendor_input_1 = require("./dto/create-vendor.input");
const update_vendor_input_1 = require("./dto/update-vendor.input");
let VendorsResolver = class VendorsResolver {
    vendorsService;
    constructor(vendorsService) {
        this.vendorsService = vendorsService;
    }
    createVendor(createVendorInput) {
        return this.vendorsService.create(createVendorInput);
    }
    findAll(organisationId) {
        return this.vendorsService.findAll(organisationId);
    }
    findOne(id) {
        return this.vendorsService.findOne(id);
    }
    updateVendor(updateVendorInput) {
        return this.vendorsService.update(updateVendorInput.id, updateVendorInput);
    }
    removeVendor(id) {
        return this.vendorsService.remove(id);
    }
};
exports.VendorsResolver = VendorsResolver;
__decorate([
    (0, graphql_1.Mutation)(() => vendor_entity_1.Vendor),
    __param(0, (0, graphql_1.Args)('createVendorInput')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_vendor_input_1.CreateVendorInput]),
    __metadata("design:returntype", void 0)
], VendorsResolver.prototype, "createVendor", null);
__decorate([
    (0, graphql_1.Query)(() => [vendor_entity_1.Vendor], { name: 'vendors' }),
    __param(0, (0, graphql_1.Args)('organisationId', { type: () => String, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VendorsResolver.prototype, "findAll", null);
__decorate([
    (0, graphql_1.Query)(() => vendor_entity_1.Vendor, { name: 'vendor' }),
    __param(0, (0, graphql_1.Args)('id', { type: () => String })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VendorsResolver.prototype, "findOne", null);
__decorate([
    (0, graphql_1.Mutation)(() => vendor_entity_1.Vendor),
    __param(0, (0, graphql_1.Args)('updateVendorInput')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_vendor_input_1.UpdateVendorInput]),
    __metadata("design:returntype", void 0)
], VendorsResolver.prototype, "updateVendor", null);
__decorate([
    (0, graphql_1.Mutation)(() => vendor_entity_1.Vendor),
    __param(0, (0, graphql_1.Args)('id', { type: () => String })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VendorsResolver.prototype, "removeVendor", null);
exports.VendorsResolver = VendorsResolver = __decorate([
    (0, graphql_1.Resolver)(() => vendor_entity_1.Vendor),
    __metadata("design:paramtypes", [vendors_service_1.VendorsService])
], VendorsResolver);
//# sourceMappingURL=vendors.resolver.js.map