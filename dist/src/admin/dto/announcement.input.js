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
exports.UpdateAnnouncementInput = exports.CreateAnnouncementInput = void 0;
const graphql_1 = require("@nestjs/graphql");
const class_validator_1 = require("class-validator");
let CreateAnnouncementInput = class CreateAnnouncementInput {
    title;
    content;
    startDate;
    endDate;
    targetRoleIds;
    targetBranchIds;
};
exports.CreateAnnouncementInput = CreateAnnouncementInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAnnouncementInput.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAnnouncementInput.prototype, "content", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateAnnouncementInput.prototype, "startDate", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateAnnouncementInput.prototype, "endDate", void 0);
__decorate([
    (0, graphql_1.Field)(() => [graphql_1.ID], { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsUUID)('4', { each: true }),
    __metadata("design:type", Array)
], CreateAnnouncementInput.prototype, "targetRoleIds", void 0);
__decorate([
    (0, graphql_1.Field)(() => [graphql_1.ID], { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsUUID)('4', { each: true }),
    __metadata("design:type", Array)
], CreateAnnouncementInput.prototype, "targetBranchIds", void 0);
exports.CreateAnnouncementInput = CreateAnnouncementInput = __decorate([
    (0, graphql_1.InputType)()
], CreateAnnouncementInput);
let UpdateAnnouncementInput = class UpdateAnnouncementInput {
    title;
    content;
    startDate;
    endDate;
    targetRoleIds;
    targetBranchIds;
    isActive;
};
exports.UpdateAnnouncementInput = UpdateAnnouncementInput;
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateAnnouncementInput.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateAnnouncementInput.prototype, "content", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateAnnouncementInput.prototype, "startDate", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateAnnouncementInput.prototype, "endDate", void 0);
__decorate([
    (0, graphql_1.Field)(() => [graphql_1.ID], { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsUUID)('4', { each: true }),
    __metadata("design:type", Array)
], UpdateAnnouncementInput.prototype, "targetRoleIds", void 0);
__decorate([
    (0, graphql_1.Field)(() => [graphql_1.ID], { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsUUID)('4', { each: true }),
    __metadata("design:type", Array)
], UpdateAnnouncementInput.prototype, "targetBranchIds", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateAnnouncementInput.prototype, "isActive", void 0);
exports.UpdateAnnouncementInput = UpdateAnnouncementInput = __decorate([
    (0, graphql_1.InputType)()
], UpdateAnnouncementInput);
//# sourceMappingURL=announcement.input.js.map