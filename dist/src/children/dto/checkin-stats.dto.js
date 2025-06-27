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
exports.CheckInStatsOutput = void 0;
const graphql_1 = require("@nestjs/graphql");
let CheckInEventStats = class CheckInEventStats {
    eventId;
    _count;
};
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], CheckInEventStats.prototype, "eventId", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], CheckInEventStats.prototype, "_count", void 0);
CheckInEventStats = __decorate([
    (0, graphql_1.ObjectType)()
], CheckInEventStats);
let CheckInStatsOutput = class CheckInStatsOutput {
    totalCheckIns;
    totalCheckOuts;
    uniqueChildrenCount;
    checkInsByEvent;
};
exports.CheckInStatsOutput = CheckInStatsOutput;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], CheckInStatsOutput.prototype, "totalCheckIns", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], CheckInStatsOutput.prototype, "totalCheckOuts", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], CheckInStatsOutput.prototype, "uniqueChildrenCount", void 0);
__decorate([
    (0, graphql_1.Field)(() => [CheckInEventStats]),
    __metadata("design:type", Array)
], CheckInStatsOutput.prototype, "checkInsByEvent", void 0);
exports.CheckInStatsOutput = CheckInStatsOutput = __decorate([
    (0, graphql_1.ObjectType)()
], CheckInStatsOutput);
//# sourceMappingURL=checkin-stats.dto.js.map