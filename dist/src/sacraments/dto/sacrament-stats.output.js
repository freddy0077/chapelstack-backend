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
exports.SacramentStatsOutput = void 0;
const graphql_1 = require("@nestjs/graphql");
let SacramentStatsOutput = class SacramentStatsOutput {
    sacramentType;
    count;
    trend;
    percentage;
    period;
};
exports.SacramentStatsOutput = SacramentStatsOutput;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], SacramentStatsOutput.prototype, "sacramentType", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Number)
], SacramentStatsOutput.prototype, "count", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], SacramentStatsOutput.prototype, "trend", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Number)
], SacramentStatsOutput.prototype, "percentage", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], SacramentStatsOutput.prototype, "period", void 0);
exports.SacramentStatsOutput = SacramentStatsOutput = __decorate([
    (0, graphql_1.ObjectType)()
], SacramentStatsOutput);
//# sourceMappingURL=sacrament-stats.output.js.map