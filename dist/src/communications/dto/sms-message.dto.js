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
exports.SmsMessageDto = void 0;
const graphql_1 = require("@nestjs/graphql");
const client_1 = require("@prisma/client");
let SmsMessageDto = class SmsMessageDto {
    id;
    body;
    senderNumber;
    recipients;
    sentAt;
    status;
    branchId;
    createdAt;
    updatedAt;
};
exports.SmsMessageDto = SmsMessageDto;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], SmsMessageDto.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], SmsMessageDto.prototype, "body", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], SmsMessageDto.prototype, "senderNumber", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String]),
    __metadata("design:type", Array)
], SmsMessageDto.prototype, "recipients", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date, { nullable: true }),
    __metadata("design:type", Object)
], SmsMessageDto.prototype, "sentAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], SmsMessageDto.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], SmsMessageDto.prototype, "branchId", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date),
    __metadata("design:type", Date)
], SmsMessageDto.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date),
    __metadata("design:type", Date)
], SmsMessageDto.prototype, "updatedAt", void 0);
exports.SmsMessageDto = SmsMessageDto = __decorate([
    (0, graphql_1.ObjectType)()
], SmsMessageDto);
//# sourceMappingURL=sms-message.dto.js.map