"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MinistriesModule = void 0;
const common_1 = require("@nestjs/common");
const ministries_service_1 = require("./services/ministries.service");
const ministries_resolver_1 = require("./resolvers/ministries.resolver");
const prisma_module_1 = require("../prisma/prisma.module");
const small_groups_service_1 = require("./services/small-groups.service");
const small_groups_resolver_1 = require("./resolvers/small-groups.resolver");
const group_members_service_1 = require("./services/group-members.service");
const group_members_resolver_1 = require("./resolvers/group-members.resolver");
const ministry_role_guard_1 = require("./guards/ministry-role.guard");
const ministry_integrations_service_1 = require("./services/ministry-integrations.service");
let MinistriesModule = class MinistriesModule {
};
exports.MinistriesModule = MinistriesModule;
exports.MinistriesModule = MinistriesModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        providers: [
            ministries_service_1.MinistriesService,
            ministries_resolver_1.MinistriesResolver,
            small_groups_service_1.SmallGroupsService,
            small_groups_resolver_1.SmallGroupsResolver,
            group_members_service_1.GroupMembersService,
            group_members_resolver_1.GroupMembersResolver,
            ministry_role_guard_1.MinistryRoleGuard,
            ministry_integrations_service_1.MinistryIntegrationsService,
            common_1.Logger,
        ],
        exports: [
            ministries_service_1.MinistriesService,
            small_groups_service_1.SmallGroupsService,
            group_members_service_1.GroupMembersService,
            ministry_integrations_service_1.MinistryIntegrationsService,
        ],
    })
], MinistriesModule);
//# sourceMappingURL=ministries.module.js.map