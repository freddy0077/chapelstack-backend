"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnboardingModule = void 0;
const common_1 = require("@nestjs/common");
const onboarding_service_1 = require("./services/onboarding.service");
const onboarding_resolver_1 = require("./resolvers/onboarding.resolver");
const prisma_module_1 = require("../prisma/prisma.module");
const branches_module_1 = require("../branches/branches.module");
const users_module_1 = require("../users/users.module");
const settings_module_1 = require("../settings/settings.module");
const members_module_1 = require("../members/members.module");
const setup_wizard_service_1 = require("./services/setup-wizard.service");
const data_import_service_1 = require("./services/data-import.service");
let OnboardingModule = class OnboardingModule {
};
exports.OnboardingModule = OnboardingModule;
exports.OnboardingModule = OnboardingModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            branches_module_1.BranchesModule,
            users_module_1.UsersModule,
            settings_module_1.SettingsModule,
            members_module_1.MembersModule,
        ],
        providers: [
            onboarding_resolver_1.OnboardingResolver,
            onboarding_service_1.OnboardingService,
            setup_wizard_service_1.SetupWizardService,
            data_import_service_1.DataImportService,
        ],
        exports: [onboarding_service_1.OnboardingService],
    })
], OnboardingModule);
//# sourceMappingURL=onboarding.module.js.map