"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SacramentsModule = void 0;
const common_1 = require("@nestjs/common");
const sacraments_service_1 = require("./sacraments.service");
const sacraments_resolver_1 = require("./sacraments.resolver");
const prisma_service_1 = require("../prisma/prisma.service");
let SacramentsModule = class SacramentsModule {
};
exports.SacramentsModule = SacramentsModule;
exports.SacramentsModule = SacramentsModule = __decorate([
    (0, common_1.Module)({
        providers: [sacraments_resolver_1.SacramentsResolver, sacraments_service_1.SacramentsService, prisma_service_1.PrismaService],
        exports: [sacraments_service_1.SacramentsService],
    })
], SacramentsModule);
//# sourceMappingURL=sacraments.module.js.map