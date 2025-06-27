"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganisationModule = void 0;
const common_1 = require("@nestjs/common");
const organisation_service_1 = require("./organisation.service");
const organisation_resolver_1 = require("./organisation.resolver");
const prisma_service_1 = require("../prisma/prisma.service");
const s3_service_1 = require("./services/s3.service");
const config_1 = require("@nestjs/config");
let OrganisationModule = class OrganisationModule {
};
exports.OrganisationModule = OrganisationModule;
exports.OrganisationModule = OrganisationModule = __decorate([
    (0, common_1.Module)({
        imports: [config_1.ConfigModule],
        providers: [organisation_resolver_1.OrganisationResolver, organisation_service_1.OrganisationService, s3_service_1.S3Service, prisma_service_1.PrismaService],
        exports: [organisation_service_1.OrganisationService],
    })
], OrganisationModule);
//# sourceMappingURL=organisation.module.js.map