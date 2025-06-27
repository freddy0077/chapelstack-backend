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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemHealth = exports.SystemInfo = exports.CpuUsage = exports.MemoryUsage = exports.DatabaseHealth = void 0;
const graphql_1 = require("@nestjs/graphql");
const graphql_2 = require("@nestjs/graphql");
let DatabaseHealth = class DatabaseHealth {
    status;
    latency;
};
exports.DatabaseHealth = DatabaseHealth;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], DatabaseHealth.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], DatabaseHealth.prototype, "latency", void 0);
exports.DatabaseHealth = DatabaseHealth = __decorate([
    (0, graphql_1.ObjectType)()
], DatabaseHealth);
let MemoryUsage = class MemoryUsage {
    rss;
    heapTotal;
    heapUsed;
    external;
};
exports.MemoryUsage = MemoryUsage;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], MemoryUsage.prototype, "rss", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], MemoryUsage.prototype, "heapTotal", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], MemoryUsage.prototype, "heapUsed", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], MemoryUsage.prototype, "external", void 0);
exports.MemoryUsage = MemoryUsage = __decorate([
    (0, graphql_1.ObjectType)()
], MemoryUsage);
let CpuUsage = class CpuUsage {
    user;
    system;
};
exports.CpuUsage = CpuUsage;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], CpuUsage.prototype, "user", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], CpuUsage.prototype, "system", void 0);
exports.CpuUsage = CpuUsage = __decorate([
    (0, graphql_1.ObjectType)()
], CpuUsage);
let SystemInfo = class SystemInfo {
    totalMemory;
    freeMemory;
    memoryUsage;
    cpuUsage;
    systemUptime;
    processUptime;
    platform;
    nodeVersion;
};
exports.SystemInfo = SystemInfo;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], SystemInfo.prototype, "totalMemory", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], SystemInfo.prototype, "freeMemory", void 0);
__decorate([
    (0, graphql_1.Field)(() => MemoryUsage),
    __metadata("design:type", MemoryUsage)
], SystemInfo.prototype, "memoryUsage", void 0);
__decorate([
    (0, graphql_1.Field)(() => CpuUsage),
    __metadata("design:type", CpuUsage)
], SystemInfo.prototype, "cpuUsage", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], SystemInfo.prototype, "systemUptime", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], SystemInfo.prototype, "processUptime", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], SystemInfo.prototype, "platform", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], SystemInfo.prototype, "nodeVersion", void 0);
exports.SystemInfo = SystemInfo = __decorate([
    (0, graphql_1.ObjectType)()
], SystemInfo);
let SystemHealth = class SystemHealth {
    timestamp;
    database;
    system;
};
exports.SystemHealth = SystemHealth;
__decorate([
    (0, graphql_1.Field)(() => graphql_2.GraphQLISODateTime),
    __metadata("design:type", Date)
], SystemHealth.prototype, "timestamp", void 0);
__decorate([
    (0, graphql_1.Field)(() => DatabaseHealth),
    __metadata("design:type", DatabaseHealth)
], SystemHealth.prototype, "database", void 0);
__decorate([
    (0, graphql_1.Field)(() => SystemInfo),
    __metadata("design:type", SystemInfo)
], SystemHealth.prototype, "system", void 0);
exports.SystemHealth = SystemHealth = __decorate([
    (0, graphql_1.ObjectType)()
], SystemHealth);
//# sourceMappingURL=system-health.entity.js.map