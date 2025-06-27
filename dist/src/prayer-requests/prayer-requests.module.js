"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrayerRequestsModule = void 0;
const common_1 = require("@nestjs/common");
const prayer_requests_service_1 = require("./prayer-requests.service");
const prayer_requests_resolver_1 = require("./prayer-requests.resolver");
const prisma_service_1 = require("../prisma/prisma.service");
let PrayerRequestsModule = class PrayerRequestsModule {
};
exports.PrayerRequestsModule = PrayerRequestsModule;
exports.PrayerRequestsModule = PrayerRequestsModule = __decorate([
    (0, common_1.Module)({
        providers: [prayer_requests_resolver_1.PrayerRequestsResolver, prayer_requests_service_1.PrayerRequestsService, prisma_service_1.PrismaService],
        exports: [prayer_requests_service_1.PrayerRequestsService],
    })
], PrayerRequestsModule);
//# sourceMappingURL=prayer-requests.module.js.map