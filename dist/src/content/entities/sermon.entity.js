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
exports.SermonEntity = void 0;
const graphql_1 = require("@nestjs/graphql");
const content_status_enum_1 = require("../enums/content-status.enum");
let SermonEntity = class SermonEntity {
    id;
    title;
    description;
    datePreached;
    speakerId;
    seriesId;
    mainScripture;
    audioUrl;
    videoUrl;
    transcriptUrl;
    transcriptText;
    duration;
    branchId;
    status;
    createdAt;
    updatedAt;
};
exports.SermonEntity = SermonEntity;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], SermonEntity.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], SermonEntity.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], SermonEntity.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], SermonEntity.prototype, "datePreached", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], SermonEntity.prototype, "speakerId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], SermonEntity.prototype, "seriesId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], SermonEntity.prototype, "mainScripture", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], SermonEntity.prototype, "audioUrl", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], SermonEntity.prototype, "videoUrl", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], SermonEntity.prototype, "transcriptUrl", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], SermonEntity.prototype, "transcriptText", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Number)
], SermonEntity.prototype, "duration", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], SermonEntity.prototype, "branchId", void 0);
__decorate([
    (0, graphql_1.Field)(() => content_status_enum_1.ContentStatus),
    __metadata("design:type", String)
], SermonEntity.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], SermonEntity.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], SermonEntity.prototype, "updatedAt", void 0);
exports.SermonEntity = SermonEntity = __decorate([
    (0, graphql_1.ObjectType)('Sermon')
], SermonEntity);
//# sourceMappingURL=sermon.entity.js.map