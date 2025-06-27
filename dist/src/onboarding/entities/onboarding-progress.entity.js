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
exports.OnboardingProgress = exports.OnboardingStep = void 0;
const graphql_1 = require("@nestjs/graphql");
var OnboardingStep;
(function (OnboardingStep) {
    OnboardingStep["WELCOME"] = "WELCOME";
    OnboardingStep["ADMIN_SETUP"] = "ADMIN_SETUP";
    OnboardingStep["ORGANIZATION_DETAILS"] = "ORGANIZATION_DETAILS";
    OnboardingStep["BRANCH_SETUP"] = "BRANCH_SETUP";
    OnboardingStep["BRANDING"] = "BRANDING";
    OnboardingStep["USER_INVITATIONS"] = "USER_INVITATIONS";
    OnboardingStep["ROLE_CONFIGURATION"] = "ROLE_CONFIGURATION";
    OnboardingStep["MEMBER_IMPORT"] = "MEMBER_IMPORT";
    OnboardingStep["FINANCIAL_SETUP"] = "FINANCIAL_SETUP";
    OnboardingStep["MODULE_QUICK_START"] = "MODULE_QUICK_START";
    OnboardingStep["COMPLETION"] = "COMPLETION";
})(OnboardingStep || (exports.OnboardingStep = OnboardingStep = {}));
(0, graphql_1.registerEnumType)(OnboardingStep, {
    name: 'OnboardingStep',
    description: 'Steps in the onboarding process',
});
let OnboardingProgress = class OnboardingProgress {
    id;
    branchId;
    completedSteps;
    currentStep;
    isCompleted;
    importedMembers;
    importedFinances;
    startedAt;
    completedAt;
    lastUpdatedAt;
};
exports.OnboardingProgress = OnboardingProgress;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], OnboardingProgress.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], OnboardingProgress.prototype, "branchId", void 0);
__decorate([
    (0, graphql_1.Field)(() => [OnboardingStep]),
    __metadata("design:type", Array)
], OnboardingProgress.prototype, "completedSteps", void 0);
__decorate([
    (0, graphql_1.Field)(() => OnboardingStep),
    __metadata("design:type", String)
], OnboardingProgress.prototype, "currentStep", void 0);
__decorate([
    (0, graphql_1.Field)(() => Boolean),
    __metadata("design:type", Boolean)
], OnboardingProgress.prototype, "isCompleted", void 0);
__decorate([
    (0, graphql_1.Field)(() => Boolean),
    __metadata("design:type", Boolean)
], OnboardingProgress.prototype, "importedMembers", void 0);
__decorate([
    (0, graphql_1.Field)(() => Boolean),
    __metadata("design:type", Boolean)
], OnboardingProgress.prototype, "importedFinances", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date),
    __metadata("design:type", Date)
], OnboardingProgress.prototype, "startedAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date, { nullable: true }),
    __metadata("design:type", Date)
], OnboardingProgress.prototype, "completedAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date),
    __metadata("design:type", Date)
], OnboardingProgress.prototype, "lastUpdatedAt", void 0);
exports.OnboardingProgress = OnboardingProgress = __decorate([
    (0, graphql_1.ObjectType)()
], OnboardingProgress);
//# sourceMappingURL=onboarding-progress.entity.js.map