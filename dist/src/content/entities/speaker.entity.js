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
exports.SpeakerEntity = void 0;
const graphql_1 = require("@nestjs/graphql");
let SpeakerEntity = class SpeakerEntity {
    id;
    name;
    title;
    bio;
    photoUrl;
    email;
    phone;
    website;
    memberId;
    branchId;
    createdAt;
    updatedAt;
};
exports.SpeakerEntity = SpeakerEntity;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], SpeakerEntity.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], SpeakerEntity.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], SpeakerEntity.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], SpeakerEntity.prototype, "bio", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], SpeakerEntity.prototype, "photoUrl", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], SpeakerEntity.prototype, "email", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], SpeakerEntity.prototype, "phone", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], SpeakerEntity.prototype, "website", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], SpeakerEntity.prototype, "memberId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], SpeakerEntity.prototype, "branchId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], SpeakerEntity.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], SpeakerEntity.prototype, "updatedAt", void 0);
exports.SpeakerEntity = SpeakerEntity = __decorate([
    (0, graphql_1.ObjectType)('Speaker')
], SpeakerEntity);
//# sourceMappingURL=speaker.entity.js.map