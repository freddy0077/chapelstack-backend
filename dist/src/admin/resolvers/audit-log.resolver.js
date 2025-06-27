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
exports.AuditLogResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const audit_log_service_1 = require("../services/audit-log.service");
const audit_log_entity_1 = require("../entities/audit-log.entity");
const create_audit_log_input_1 = require("../dto/create-audit-log.input");
const audit_log_filter_input_1 = require("../dto/audit-log-filter.input");
const pagination_input_1 = require("../../common/dto/pagination.input");
const common_1 = require("@nestjs/common");
const gql_auth_guard_1 = require("../../auth/guards/gql-auth.guard");
const roles_guard_1 = require("../../auth/guards/roles.guard");
const roles_decorator_1 = require("../../auth/decorators/roles.decorator");
let AuditLogResolver = class AuditLogResolver {
    auditLogService;
    constructor(auditLogService) {
        this.auditLogService = auditLogService;
    }
    createAuditLog(createAuditLogInput) {
        return this.auditLogService.create(createAuditLogInput);
    }
    findOne(id) {
        return this.auditLogService.findOne(id);
    }
    findAll(paginationInput = { skip: 0, take: 10 }, filterInput) {
        return this.auditLogService.findAll(paginationInput, filterInput);
    }
};
exports.AuditLogResolver = AuditLogResolver;
__decorate([
    (0, graphql_1.Mutation)(() => audit_log_entity_1.AuditLog),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN', 'SYSTEM_ADMIN'),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_audit_log_input_1.CreateAuditLogInput]),
    __metadata("design:returntype", void 0)
], AuditLogResolver.prototype, "createAuditLog", null);
__decorate([
    (0, graphql_1.Query)(() => audit_log_entity_1.AuditLog, { name: 'auditLog' }),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN', 'SYSTEM_ADMIN', 'BRANCH_ADMIN'),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AuditLogResolver.prototype, "findOne", null);
__decorate([
    (0, graphql_1.Query)(() => [audit_log_entity_1.AuditLog], { name: 'auditLogs' }),
    (0, roles_decorator_1.Roles)('SUPER_ADMIN', 'SYSTEM_ADMIN', 'BRANCH_ADMIN'),
    __param(0, (0, graphql_1.Args)('pagination', { nullable: true })),
    __param(1, (0, graphql_1.Args)('filter', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_input_1.PaginationInput,
        audit_log_filter_input_1.AuditLogFilterInput]),
    __metadata("design:returntype", void 0)
], AuditLogResolver.prototype, "findAll", null);
exports.AuditLogResolver = AuditLogResolver = __decorate([
    (0, graphql_1.Resolver)(() => audit_log_entity_1.AuditLog),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [audit_log_service_1.AuditLogService])
], AuditLogResolver);
//# sourceMappingURL=audit-log.resolver.js.map