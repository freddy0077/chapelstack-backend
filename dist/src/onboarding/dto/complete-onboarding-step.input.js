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
exports.CompleteOnboardingStepInput = void 0;
const graphql_1 = require("@nestjs/graphql");
const class_validator_1 = require("class-validator");
const onboarding_progress_entity_1 = require("../entities/onboarding-progress.entity");
const enum_validation_util_1 = require("../../common/utils/enum-validation.util");
let CompleteOnboardingStepInput = class CompleteOnboardingStepInput {
    branchId;
    stepKey;
    name;
    email;
    phoneNumber;
    website;
    address;
    city;
    state;
    country;
    zipCode;
    description;
    selectedModules;
};
exports.CompleteOnboardingStepInput = CompleteOnboardingStepInput;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    (0, class_validator_1.IsUUID)('4', { message: 'Invalid branch ID format' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Branch ID is required' }),
    __metadata("design:type", String)
], CompleteOnboardingStepInput.prototype, "branchId", void 0);
__decorate([
    (0, graphql_1.Field)(() => onboarding_progress_entity_1.OnboardingStep),
    (0, enum_validation_util_1.IsValidEnum)(onboarding_progress_entity_1.OnboardingStep, { message: 'Invalid onboarding step' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Step key is required' }),
    __metadata("design:type", String)
], CompleteOnboardingStepInput.prototype, "stepKey", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CompleteOnboardingStepInput.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CompleteOnboardingStepInput.prototype, "email", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CompleteOnboardingStepInput.prototype, "phoneNumber", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CompleteOnboardingStepInput.prototype, "website", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CompleteOnboardingStepInput.prototype, "address", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CompleteOnboardingStepInput.prototype, "city", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CompleteOnboardingStepInput.prototype, "state", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CompleteOnboardingStepInput.prototype, "country", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CompleteOnboardingStepInput.prototype, "zipCode", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CompleteOnboardingStepInput.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], CompleteOnboardingStepInput.prototype, "selectedModules", void 0);
exports.CompleteOnboardingStepInput = CompleteOnboardingStepInput = __decorate([
    (0, graphql_1.InputType)()
], CompleteOnboardingStepInput);
//# sourceMappingURL=complete-onboarding-step.input.js.map