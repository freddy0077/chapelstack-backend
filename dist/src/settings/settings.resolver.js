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
exports.SettingsResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const settings_service_1 = require("./settings.service");
const setting_entity_1 = require("./entities/setting.entity");
const create_setting_input_1 = require("./dto/create-setting.input");
const update_setting_input_1 = require("./dto/update-setting.input");
const common_1 = require("@nestjs/common");
const gql_auth_guard_1 = require("../auth/guards/gql-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
let SettingsResolver = class SettingsResolver {
    settingsService;
    constructor(settingsService) {
        this.settingsService = settingsService;
    }
    async createBranchSetting(input) {
        return this.settingsService.create(input);
    }
    async updateSetting(id, input) {
        return this.settingsService.update(id, input);
    }
    async getSettings(branchId) {
        if (branchId) {
            return this.settingsService.findAll(branchId);
        }
        return this.settingsService.findAll(undefined, true);
    }
};
exports.SettingsResolver = SettingsResolver;
__decorate([
    (0, graphql_1.Mutation)(() => setting_entity_1.Setting, { name: 'createBranchSetting' }),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_setting_input_1.CreateSettingInput]),
    __metadata("design:returntype", Promise)
], SettingsResolver.prototype, "createBranchSetting", null);
__decorate([
    (0, graphql_1.Mutation)(() => setting_entity_1.Setting, { name: 'updateSetting' }),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_setting_input_1.UpdateSettingInput]),
    __metadata("design:returntype", Promise)
], SettingsResolver.prototype, "updateSetting", null);
__decorate([
    (0, graphql_1.Query)(() => [setting_entity_1.Setting], { name: 'settings' }),
    __param(0, (0, graphql_1.Args)('branchId', { type: () => String, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SettingsResolver.prototype, "getSettings", null);
exports.SettingsResolver = SettingsResolver = __decorate([
    (0, graphql_1.Resolver)(() => setting_entity_1.Setting),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [settings_service_1.SettingsService])
], SettingsResolver);
//# sourceMappingURL=settings.resolver.js.map