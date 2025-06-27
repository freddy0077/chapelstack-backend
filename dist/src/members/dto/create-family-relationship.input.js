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
exports.CreateFamilyRelationshipInput = void 0;
const graphql_1 = require("@nestjs/graphql");
const class_validator_1 = require("class-validator");
const family_entity_1 = require("../entities/family.entity");
const enum_validation_util_1 = require("../../common/utils/enum-validation.util");
let CreateFamilyRelationshipInput = class CreateFamilyRelationshipInput {
    memberId;
    relatedMemberId;
    relationshipType;
    familyId;
};
exports.CreateFamilyRelationshipInput = CreateFamilyRelationshipInput;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateFamilyRelationshipInput.prototype, "memberId", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateFamilyRelationshipInput.prototype, "relatedMemberId", void 0);
__decorate([
    (0, graphql_1.Field)(() => family_entity_1.FamilyRelationshipType),
    (0, class_validator_1.IsNotEmpty)(),
    (0, enum_validation_util_1.IsValidEnum)(family_entity_1.FamilyRelationshipType),
    __metadata("design:type", String)
], CreateFamilyRelationshipInput.prototype, "relationshipType", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateFamilyRelationshipInput.prototype, "familyId", void 0);
exports.CreateFamilyRelationshipInput = CreateFamilyRelationshipInput = __decorate([
    (0, graphql_1.InputType)()
], CreateFamilyRelationshipInput);
//# sourceMappingURL=create-family-relationship.input.js.map