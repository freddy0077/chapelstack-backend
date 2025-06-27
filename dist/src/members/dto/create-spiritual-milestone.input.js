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
exports.CreateSpiritualMilestoneInput = void 0;
const graphql_1 = require("@nestjs/graphql");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const spiritual_milestone_entity_1 = require("../entities/spiritual-milestone.entity");
const graphql_type_json_1 = require("graphql-type-json");
const graphql_2 = require("@nestjs/graphql");
const enum_validation_util_1 = require("../../common/utils/enum-validation.util");
let CreateSpiritualMilestoneInput = class CreateSpiritualMilestoneInput {
    type;
    date;
    location;
    performedBy;
    description;
    additionalDetails;
    memberId;
};
exports.CreateSpiritualMilestoneInput = CreateSpiritualMilestoneInput;
__decorate([
    (0, graphql_1.Field)(() => spiritual_milestone_entity_1.MilestoneType),
    (0, class_validator_1.IsNotEmpty)(),
    (0, enum_validation_util_1.IsValidEnum)(spiritual_milestone_entity_1.MilestoneType),
    __metadata("design:type", String)
], CreateSpiritualMilestoneInput.prototype, "type", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_2.GraphQLISODateTime),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], CreateSpiritualMilestoneInput.prototype, "date", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSpiritualMilestoneInput.prototype, "location", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSpiritualMilestoneInput.prototype, "performedBy", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSpiritualMilestoneInput.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSON, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateSpiritualMilestoneInput.prototype, "additionalDetails", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateSpiritualMilestoneInput.prototype, "memberId", void 0);
exports.CreateSpiritualMilestoneInput = CreateSpiritualMilestoneInput = __decorate([
    (0, graphql_1.InputType)()
], CreateSpiritualMilestoneInput);
//# sourceMappingURL=create-spiritual-milestone.input.js.map