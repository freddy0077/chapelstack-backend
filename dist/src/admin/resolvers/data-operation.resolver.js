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
exports.DataOperationResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const data_operation_service_1 = require("../services/data-operation.service");
const data_operation_entity_1 = require("../entities/data-operation.entity");
const data_operation_input_1 = require("../dto/data-operation.input");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../auth/guards/roles.guard");
const roles_decorator_1 = require("../../auth/decorators/roles.decorator");
const common_2 = require("@nestjs/common");
let DataOperationResolver = class DataOperationResolver {
    dataOperationService;
    constructor(dataOperationService) {
        this.dataOperationService = dataOperationService;
    }
    async createDataImport(input, context) {
        const { req } = context;
        const userId = req.user?.id || input.userId;
        const ipAddress = req.ip;
        const userAgent = req.headers['user-agent'];
        return this.dataOperationService.createDataImport({ ...input, userId }, ipAddress, userAgent);
    }
    async createDataExport(input, context) {
        const { req } = context;
        const userId = req.user?.id || input.userId;
        const ipAddress = req.ip;
        const userAgent = req.headers['user-agent'];
        return this.dataOperationService.createDataExport({ ...input, userId }, ipAddress, userAgent);
    }
    async dataOperation(id) {
        return this.dataOperationService.getDataOperation(id);
    }
    async dataOperations(filter) {
        return this.dataOperationService.getDataOperations(filter);
    }
    async cancelDataOperation(id, context) {
        const { req } = context;
        const userId = req.user?.id;
        const ipAddress = req.ip;
        const userAgent = req.headers['user-agent'];
        return this.dataOperationService.cancelDataOperation(id, userId, ipAddress, userAgent);
    }
};
exports.DataOperationResolver = DataOperationResolver;
__decorate([
    (0, graphql_1.Mutation)(() => data_operation_entity_1.DataOperation),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN', 'ADMIN'),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [data_operation_input_1.CreateDataImportInput, Object]),
    __metadata("design:returntype", Promise)
], DataOperationResolver.prototype, "createDataImport", null);
__decorate([
    (0, graphql_1.Mutation)(() => data_operation_entity_1.DataOperation),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN', 'ADMIN'),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [data_operation_input_1.CreateDataExportInput, Object]),
    __metadata("design:returntype", Promise)
], DataOperationResolver.prototype, "createDataExport", null);
__decorate([
    (0, graphql_1.Query)(() => data_operation_entity_1.DataOperation),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN', 'ADMIN'),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID }, common_2.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DataOperationResolver.prototype, "dataOperation", null);
__decorate([
    (0, graphql_1.Query)(() => [data_operation_entity_1.DataOperation]),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN', 'ADMIN'),
    __param(0, (0, graphql_1.Args)('filter', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [data_operation_input_1.DataOperationFilterInput]),
    __metadata("design:returntype", Promise)
], DataOperationResolver.prototype, "dataOperations", null);
__decorate([
    (0, graphql_1.Mutation)(() => data_operation_entity_1.DataOperation),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN', 'ADMIN'),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID }, common_2.ParseUUIDPipe)),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DataOperationResolver.prototype, "cancelDataOperation", null);
exports.DataOperationResolver = DataOperationResolver = __decorate([
    (0, graphql_1.Resolver)(() => data_operation_entity_1.DataOperation),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [data_operation_service_1.DataOperationService])
], DataOperationResolver);
//# sourceMappingURL=data-operation.resolver.js.map