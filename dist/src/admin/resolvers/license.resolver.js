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
exports.LicenseResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const graphql_type_json_1 = require("graphql-type-json");
const common_1 = require("@nestjs/common");
const license_service_1 = require("../services/license.service");
const license_entity_1 = require("../entities/license.entity");
const license_input_1 = require("../dto/license.input");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../auth/guards/roles.guard");
const roles_decorator_1 = require("../../auth/decorators/roles.decorator");
const common_2 = require("@nestjs/common");
let LicenseResolver = class LicenseResolver {
    licenseService;
    constructor(licenseService) {
        this.licenseService = licenseService;
    }
    async createLicense(input, context) {
        const { req } = context;
        const userId = req.user?.id;
        const ipAddress = req.ip;
        const userAgent = req.headers['user-agent'];
        return this.licenseService.createLicense(input, userId, ipAddress, userAgent);
    }
    async license(id) {
        return this.licenseService.getLicense(id);
    }
    async licenseByKey(key) {
        return this.licenseService.getLicenseByKey(key);
    }
    async licenses(filter) {
        return this.licenseService.getLicenses(filter);
    }
    async updateLicense(id, input, context) {
        const { req } = context;
        const userId = req.user?.id;
        const ipAddress = req.ip;
        const userAgent = req.headers['user-agent'];
        return this.licenseService.updateLicense(id, input, userId, ipAddress, userAgent);
    }
    async deleteLicense(id, context) {
        const { req } = context;
        const userId = req.user?.id;
        const ipAddress = req.ip;
        const userAgent = req.headers['user-agent'];
        return this.licenseService.deleteLicense(id, userId, ipAddress, userAgent);
    }
    async generateLicenseKey() {
        return this.licenseService.generateLicenseKey();
    }
    async validateCurrentLicense() {
        return this.licenseService.validateCurrentLicense();
    }
};
exports.LicenseResolver = LicenseResolver;
__decorate([
    (0, graphql_1.Mutation)(() => license_entity_1.License),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN'),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [license_input_1.CreateLicenseInput, Object]),
    __metadata("design:returntype", Promise)
], LicenseResolver.prototype, "createLicense", null);
__decorate([
    (0, graphql_1.Query)(() => license_entity_1.License),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN', 'ADMIN'),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID }, common_2.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LicenseResolver.prototype, "license", null);
__decorate([
    (0, graphql_1.Query)(() => license_entity_1.License),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN', 'ADMIN'),
    __param(0, (0, graphql_1.Args)('key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LicenseResolver.prototype, "licenseByKey", null);
__decorate([
    (0, graphql_1.Query)(() => [license_entity_1.License]),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN', 'ADMIN'),
    __param(0, (0, graphql_1.Args)('filter', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [license_input_1.LicenseFilterInput]),
    __metadata("design:returntype", Promise)
], LicenseResolver.prototype, "licenses", null);
__decorate([
    (0, graphql_1.Mutation)(() => license_entity_1.License),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN'),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID }, common_2.ParseUUIDPipe)),
    __param(1, (0, graphql_1.Args)('input')),
    __param(2, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, license_input_1.UpdateLicenseInput, Object]),
    __metadata("design:returntype", Promise)
], LicenseResolver.prototype, "updateLicense", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN'),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID }, common_2.ParseUUIDPipe)),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LicenseResolver.prototype, "deleteLicense", null);
__decorate([
    (0, graphql_1.Query)(() => String),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LicenseResolver.prototype, "generateLicenseKey", null);
__decorate([
    (0, graphql_1.Query)(() => graphql_type_json_1.GraphQLJSON),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LicenseResolver.prototype, "validateCurrentLicense", null);
exports.LicenseResolver = LicenseResolver = __decorate([
    (0, graphql_1.Resolver)(() => license_entity_1.License),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [license_service_1.LicenseService])
], LicenseResolver);
//# sourceMappingURL=license.resolver.js.map