"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
common_1.Logger.overrideLogger(['log', 'error', 'warn', 'debug', 'verbose']);
const onboarding_module_1 = require("./onboarding/onboarding.module");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const base_module_1 = require("./base/base.module");
const config_1 = require("@nestjs/config");
const graphql_1 = require("@nestjs/graphql");
const apollo_1 = require("@nestjs/apollo");
const path_1 = require("path");
const app_resolver_1 = require("./app.resolver");
const auth_module_1 = require("./auth/auth.module");
const branches_module_1 = require("./branches/branches.module");
const organisation_module_1 = require("./organisation/organisation.module");
const settings_module_1 = require("./settings/settings.module");
const branch_entity_1 = require("./branches/entities/branch.entity");
const system_settings_module_1 = require("./system-settings/system-settings.module");
const admin_module_1 = require("./admin/admin.module");
const prisma_module_1 = require("./prisma/prisma.module");
const common_module_1 = require("./common/common.module");
const graphql_type_json_1 = __importDefault(require("graphql-type-json"));
const attendance_stats_input_1 = require("./attendance/dto/attendance-stats.input");
const events_module_1 = require("./events/events.module");
const members_module_1 = require("./members/members.module");
const ministries_module_1 = require("./ministries/ministries.module");
const attendance_module_1 = require("./attendance/attendance.module");
const sacraments_module_1 = require("./sacraments/sacraments.module");
const children_module_1 = require("./children/children.module");
const forms_module_1 = require("./forms/forms.module");
const reporting_module_1 = require("./reporting/reporting.module");
const content_module_1 = require("./content/content.module");
const communications_module_1 = require("./communications/communications.module");
const prayer_requests_module_1 = require("./prayer-requests/prayer-requests.module");
const budgets_module_1 = require("./budgets/budgets.module");
const pledges_module_1 = require("./pledges/pledges.module");
const expenses_module_1 = require("./expenses/expenses.module");
const funds_module_1 = require("./funds/funds.module");
const contributions_module_1 = require("./contributions/contributions.module");
const expense_categories_module_1 = require("./expense-categories/expense-categories.module");
const vendors_module_1 = require("./vendors/vendors.module");
const contribution_types_module_1 = require("./contribution-types/contribution-types.module");
const payment_methods_module_1 = require("./payment-methods/payment-methods.module");
const graphql_2 = require("@nestjs/graphql");
(0, graphql_2.registerEnumType)(attendance_stats_input_1.AttendanceStatsPeriod, {
    name: 'AttendanceStatsPeriod',
});
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            onboarding_module_1.OnboardingModule,
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            base_module_1.BaseModule,
            common_module_1.CommonModule,
            graphql_1.GraphQLModule.forRoot({
                debug: true,
                playground: true,
                driver: apollo_1.ApolloDriver,
                autoSchemaFile: (0, path_1.join)(process.cwd(), 'src/schema.gql'),
                sortSchema: true,
                buildSchemaOptions: {
                    orphanedTypes: [branch_entity_1.Branch],
                    scalarsMap: [
                        { type: Date, scalar: graphql_1.GraphQLISODateTime },
                        { type: () => Object, scalar: graphql_type_json_1.default },
                    ],
                },
            }),
            auth_module_1.AuthModule,
            branches_module_1.BranchesModule,
            organisation_module_1.OrganisationModule,
            system_settings_module_1.SystemSettingsModule,
            admin_module_1.AdminModule,
            prisma_module_1.PrismaModule,
            settings_module_1.SettingsModule,
            members_module_1.MembersModule,
            events_module_1.EventsModule,
            ministries_module_1.MinistriesModule,
            attendance_module_1.AttendanceModule,
            sacraments_module_1.SacramentsModule,
            children_module_1.ChildrenModule,
            forms_module_1.FormsModule,
            reporting_module_1.ReportingModule,
            content_module_1.ContentModule,
            communications_module_1.CommunicationsModule,
            prayer_requests_module_1.PrayerRequestsModule,
            budgets_module_1.BudgetsModule,
            pledges_module_1.PledgesModule,
            expenses_module_1.ExpensesModule,
            funds_module_1.FundsModule,
            contributions_module_1.ContributionsModule,
            expense_categories_module_1.ExpenseCategoriesModule,
            vendors_module_1.VendorsModule,
            contribution_types_module_1.ContributionTypesModule,
            payment_methods_module_1.PaymentMethodsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService, app_resolver_1.AppResolver],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map