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
exports.InitialSettingsInput = void 0;
const graphql_1 = require("@nestjs/graphql");
const class_validator_1 = require("class-validator");
const graphql_upload_1 = require("graphql-upload");
let InitialSettingsInput = class InitialSettingsInput {
    organizationName;
    organizationDescription;
    primaryColor;
    secondaryColor;
    websiteUrl;
    logo;
};
exports.InitialSettingsInput = InitialSettingsInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Organization name is required' }),
    __metadata("design:type", String)
], InitialSettingsInput.prototype, "organizationName", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], InitialSettingsInput.prototype, "organizationDescription", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], InitialSettingsInput.prototype, "primaryColor", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], InitialSettingsInput.prototype, "secondaryColor", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsUrl)({}, { message: 'Please provide a valid website URL' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], InitialSettingsInput.prototype, "websiteUrl", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_upload_1.GraphQLUpload, { nullable: true }),
    __metadata("design:type", Promise)
], InitialSettingsInput.prototype, "logo", void 0);
exports.InitialSettingsInput = InitialSettingsInput = __decorate([
    (0, graphql_1.InputType)()
], InitialSettingsInput);
//# sourceMappingURL=initial-settings.input.js.map