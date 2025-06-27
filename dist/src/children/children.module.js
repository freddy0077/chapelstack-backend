"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChildrenModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../prisma/prisma.module");
const children_service_1 = require("./services/children.service");
const guardians_service_1 = require("./services/guardians.service");
const checkin_service_1 = require("./services/checkin.service");
const volunteers_service_1 = require("./services/volunteers.service");
const events_service_1 = require("./services/events.service");
const children_resolver_1 = require("./resolvers/children.resolver");
const guardians_resolver_1 = require("./resolvers/guardians.resolver");
const checkin_resolver_1 = require("./resolvers/checkin.resolver");
const volunteers_resolver_1 = require("./resolvers/volunteers.resolver");
const events_resolver_1 = require("./resolvers/events.resolver");
const children_controller_1 = require("./controllers/children.controller");
const guardians_controller_1 = require("./controllers/guardians.controller");
const checkin_controller_1 = require("./controllers/checkin.controller");
const volunteers_controller_1 = require("./controllers/volunteers.controller");
const events_controller_1 = require("./controllers/events.controller");
let ChildrenModule = class ChildrenModule {
};
exports.ChildrenModule = ChildrenModule;
exports.ChildrenModule = ChildrenModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        providers: [
            children_service_1.ChildrenService,
            guardians_service_1.GuardiansService,
            checkin_service_1.CheckinService,
            volunteers_service_1.VolunteersService,
            events_service_1.EventsService,
            children_resolver_1.ChildrenResolver,
            guardians_resolver_1.GuardiansResolver,
            checkin_resolver_1.CheckinResolver,
            volunteers_resolver_1.VolunteersResolver,
            events_resolver_1.EventsResolver,
        ],
        controllers: [
            children_controller_1.ChildrenController,
            guardians_controller_1.GuardiansController,
            checkin_controller_1.CheckinController,
            volunteers_controller_1.VolunteersController,
            events_controller_1.EventsController,
        ],
        exports: [
            children_service_1.ChildrenService,
            guardians_service_1.GuardiansService,
            checkin_service_1.CheckinService,
            volunteers_service_1.VolunteersService,
            events_service_1.EventsService,
        ],
    })
], ChildrenModule);
//# sourceMappingURL=children.module.js.map