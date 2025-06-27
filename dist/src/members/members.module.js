"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MembersModule = void 0;
const common_1 = require("@nestjs/common");
const members_service_1 = require("./services/members.service");
const spiritual_milestones_service_1 = require("./services/spiritual-milestones.service");
const families_service_1 = require("./services/families.service");
const members_resolver_1 = require("./resolvers/members.resolver");
const spiritual_milestones_resolver_1 = require("./resolvers/spiritual-milestones.resolver");
const families_resolver_1 = require("./resolvers/families.resolver");
const prisma_module_1 = require("../prisma/prisma.module");
const audit_module_1 = require("../audit/audit.module");
let MembersModule = class MembersModule {
};
exports.MembersModule = MembersModule;
exports.MembersModule = MembersModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, audit_module_1.AuditModule],
        providers: [
            members_service_1.MembersService,
            spiritual_milestones_service_1.SpiritualMilestonesService,
            families_service_1.FamiliesService,
            members_resolver_1.MembersResolver,
            spiritual_milestones_resolver_1.SpiritualMilestonesResolver,
            families_resolver_1.FamiliesResolver,
        ],
        exports: [members_service_1.MembersService, spiritual_milestones_service_1.SpiritualMilestonesService, families_service_1.FamiliesService],
    })
], MembersModule);
//# sourceMappingURL=members.module.js.map