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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WidgetConfig = exports.UserDashboardPreference = void 0;
const graphql_1 = require("@nestjs/graphql");
const graphql_type_json_1 = __importDefault(require("graphql-type-json"));
const dashboard_data_entity_1 = require("./dashboard-data.entity");
let UserDashboardPreference = class UserDashboardPreference {
    id;
    userId;
    branchId;
    dashboardType;
    layoutConfig;
    createdAt;
    updatedAt;
};
exports.UserDashboardPreference = UserDashboardPreference;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], UserDashboardPreference.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], UserDashboardPreference.prototype, "userId", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], UserDashboardPreference.prototype, "branchId", void 0);
__decorate([
    (0, graphql_1.Field)(() => dashboard_data_entity_1.DashboardType),
    __metadata("design:type", String)
], UserDashboardPreference.prototype, "dashboardType", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.default),
    __metadata("design:type", Object)
], UserDashboardPreference.prototype, "layoutConfig", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date),
    __metadata("design:type", Date)
], UserDashboardPreference.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date),
    __metadata("design:type", Date)
], UserDashboardPreference.prototype, "updatedAt", void 0);
exports.UserDashboardPreference = UserDashboardPreference = __decorate([
    (0, graphql_1.ObjectType)()
], UserDashboardPreference);
let WidgetConfig = class WidgetConfig {
    widgetId;
    widgetType;
    visible;
    order;
    size;
};
exports.WidgetConfig = WidgetConfig;
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], WidgetConfig.prototype, "widgetId", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], WidgetConfig.prototype, "widgetType", void 0);
__decorate([
    (0, graphql_1.Field)(() => Boolean),
    __metadata("design:type", Boolean)
], WidgetConfig.prototype, "visible", void 0);
__decorate([
    (0, graphql_1.Field)(() => Number),
    __metadata("design:type", Number)
], WidgetConfig.prototype, "order", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], WidgetConfig.prototype, "size", void 0);
exports.WidgetConfig = WidgetConfig = __decorate([
    (0, graphql_1.ObjectType)()
], WidgetConfig);
//# sourceMappingURL=user-dashboard-preference.entity.js.map