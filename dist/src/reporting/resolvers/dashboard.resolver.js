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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const graphql_type_json_1 = __importDefault(require("graphql-type-json"));
const common_1 = require("@nestjs/common");
const dashboard_service_1 = require("../services/dashboard.service");
const dashboard_data_entity_1 = require("../entities/dashboard-data.entity");
const gql_auth_guard_1 = require("../../auth/guards/gql-auth.guard");
const permissions_guard_1 = require("../../auth/guards/permissions.guard");
const require_permissions_decorator_1 = require("../../auth/decorators/require-permissions.decorator");
const user_dashboard_preference_entity_1 = require("../entities/user-dashboard-preference.entity");
const current_user_decorator_1 = require("../../auth/decorators/current-user.decorator");
let DashboardResolver = class DashboardResolver {
    dashboardService;
    constructor(dashboardService) {
        this.dashboardService = dashboardService;
    }
    async dashboardData(branchId, dashboardType, user, organisationId) {
        return await this.dashboardService.getDashboardData(user.id, branchId, dashboardType);
    }
    async userDashboardPreference(branchId, dashboardType, user, organisationId) {
        return await this.dashboardService.getUserDashboardPreference(user.id, branchId, dashboardType);
    }
    async saveUserDashboardPreference(branchId, dashboardType, layoutConfig, user, organisationId) {
        return await this.dashboardService.saveUserDashboardPreference(user.id, branchId, dashboardType, layoutConfig, organisationId);
    }
};
exports.DashboardResolver = DashboardResolver;
__decorate([
    (0, graphql_1.Query)(() => dashboard_data_entity_1.DashboardData),
    (0, require_permissions_decorator_1.RequirePermissions)({ action: 'view', subject: 'dashboard' }),
    __param(0, (0, graphql_1.Args)('branchId', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('dashboardType', { type: () => dashboard_data_entity_1.DashboardType })),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __param(3, (0, graphql_1.Args)('organisationId', { type: () => graphql_1.ID, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, String]),
    __metadata("design:returntype", Promise)
], DashboardResolver.prototype, "dashboardData", null);
__decorate([
    (0, graphql_1.Query)(() => user_dashboard_preference_entity_1.UserDashboardPreference, { nullable: true }),
    (0, require_permissions_decorator_1.RequirePermissions)({ action: 'view', subject: 'dashboard' }),
    __param(0, (0, graphql_1.Args)('branchId', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('dashboardType', { type: () => dashboard_data_entity_1.DashboardType })),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __param(3, (0, graphql_1.Args)('organisationId', { type: () => graphql_1.ID, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, String]),
    __metadata("design:returntype", Promise)
], DashboardResolver.prototype, "userDashboardPreference", null);
__decorate([
    (0, graphql_1.Mutation)(() => user_dashboard_preference_entity_1.UserDashboardPreference),
    (0, require_permissions_decorator_1.RequirePermissions)({ action: 'update', subject: 'dashboard' }),
    __param(0, (0, graphql_1.Args)('branchId', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('dashboardType', { type: () => dashboard_data_entity_1.DashboardType })),
    __param(2, (0, graphql_1.Args)('layoutConfig', { type: () => graphql_type_json_1.default })),
    __param(3, (0, current_user_decorator_1.CurrentUser)()),
    __param(4, (0, graphql_1.Args)('organisationId', { type: () => graphql_1.ID, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object, String]),
    __metadata("design:returntype", Promise)
], DashboardResolver.prototype, "saveUserDashboardPreference", null);
exports.DashboardResolver = DashboardResolver = __decorate([
    (0, graphql_1.Resolver)(),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [dashboard_service_1.DashboardService])
], DashboardResolver);
//# sourceMappingURL=dashboard.resolver.js.map