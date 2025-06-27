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
exports.RecipientGroupStats = exports.CommunicationChannelStats = exports.CommunicationStatsEntity = exports.MessageTimeSeriesData = exports.MessageTypeCount = exports.MessageStatusCount = void 0;
const graphql_1 = require("@nestjs/graphql");
let MessageStatusCount = class MessageStatusCount {
    status;
    count;
};
exports.MessageStatusCount = MessageStatusCount;
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], MessageStatusCount.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], MessageStatusCount.prototype, "count", void 0);
exports.MessageStatusCount = MessageStatusCount = __decorate([
    (0, graphql_1.ObjectType)()
], MessageStatusCount);
let MessageTypeCount = class MessageTypeCount {
    type;
    count;
};
exports.MessageTypeCount = MessageTypeCount;
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], MessageTypeCount.prototype, "type", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], MessageTypeCount.prototype, "count", void 0);
exports.MessageTypeCount = MessageTypeCount = __decorate([
    (0, graphql_1.ObjectType)()
], MessageTypeCount);
let MessageTimeSeriesData = class MessageTimeSeriesData {
    date;
    count;
};
exports.MessageTimeSeriesData = MessageTimeSeriesData;
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], MessageTimeSeriesData.prototype, "date", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], MessageTimeSeriesData.prototype, "count", void 0);
exports.MessageTimeSeriesData = MessageTimeSeriesData = __decorate([
    (0, graphql_1.ObjectType)()
], MessageTimeSeriesData);
let CommunicationStatsEntity = class CommunicationStatsEntity {
    totalEmailsSent;
    totalSmsSent;
    totalNotifications;
    emailStatusCounts;
    smsStatusCounts;
    messagesByDate;
    activeTemplates;
    deliveryRate;
    averageResponseTime;
};
exports.CommunicationStatsEntity = CommunicationStatsEntity;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], CommunicationStatsEntity.prototype, "totalEmailsSent", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], CommunicationStatsEntity.prototype, "totalSmsSent", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], CommunicationStatsEntity.prototype, "totalNotifications", void 0);
__decorate([
    (0, graphql_1.Field)(() => [MessageStatusCount]),
    __metadata("design:type", Array)
], CommunicationStatsEntity.prototype, "emailStatusCounts", void 0);
__decorate([
    (0, graphql_1.Field)(() => [MessageStatusCount]),
    __metadata("design:type", Array)
], CommunicationStatsEntity.prototype, "smsStatusCounts", void 0);
__decorate([
    (0, graphql_1.Field)(() => [MessageTimeSeriesData]),
    __metadata("design:type", Array)
], CommunicationStatsEntity.prototype, "messagesByDate", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], CommunicationStatsEntity.prototype, "activeTemplates", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], CommunicationStatsEntity.prototype, "deliveryRate", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], CommunicationStatsEntity.prototype, "averageResponseTime", void 0);
exports.CommunicationStatsEntity = CommunicationStatsEntity = __decorate([
    (0, graphql_1.ObjectType)()
], CommunicationStatsEntity);
let CommunicationChannelStats = class CommunicationChannelStats {
    channel;
    messagesSent;
    deliveryRate;
    openRate;
};
exports.CommunicationChannelStats = CommunicationChannelStats;
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], CommunicationChannelStats.prototype, "channel", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], CommunicationChannelStats.prototype, "messagesSent", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], CommunicationChannelStats.prototype, "deliveryRate", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], CommunicationChannelStats.prototype, "openRate", void 0);
exports.CommunicationChannelStats = CommunicationChannelStats = __decorate([
    (0, graphql_1.ObjectType)()
], CommunicationChannelStats);
let RecipientGroupStats = class RecipientGroupStats {
    groupName;
    recipientCount;
    messagesSent;
};
exports.RecipientGroupStats = RecipientGroupStats;
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], RecipientGroupStats.prototype, "groupName", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], RecipientGroupStats.prototype, "recipientCount", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], RecipientGroupStats.prototype, "messagesSent", void 0);
exports.RecipientGroupStats = RecipientGroupStats = __decorate([
    (0, graphql_1.ObjectType)()
], RecipientGroupStats);
//# sourceMappingURL=communication-stats.entity.js.map