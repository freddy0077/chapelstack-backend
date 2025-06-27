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
exports.UpdatePrayerRequestInput = void 0;
const graphql_1 = require("@nestjs/graphql");
const create_prayer_request_input_1 = require("./create-prayer-request.input");
const prayer_request_status_enum_1 = require("../prayer-request-status.enum");
const class_validator_1 = require("class-validator");
let UpdatePrayerRequestInput = class UpdatePrayerRequestInput extends (0, graphql_1.PartialType)(create_prayer_request_input_1.CreatePrayerRequestInput) {
    requestText;
    status;
    assignedPastorId;
    organisationId;
};
exports.UpdatePrayerRequestInput = UpdatePrayerRequestInput;
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePrayerRequestInput.prototype, "requestText", void 0);
__decorate([
    (0, graphql_1.Field)(() => prayer_request_status_enum_1.PrayerRequestStatusEnum, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(prayer_request_status_enum_1.PrayerRequestStatusEnum),
    __metadata("design:type", String)
], UpdatePrayerRequestInput.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], UpdatePrayerRequestInput.prototype, "assignedPastorId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePrayerRequestInput.prototype, "organisationId", void 0);
exports.UpdatePrayerRequestInput = UpdatePrayerRequestInput = __decorate([
    (0, graphql_1.InputType)()
], UpdatePrayerRequestInput);
//# sourceMappingURL=update-prayer-request.input.js.map