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
exports.FamilyRelationship = exports.Family = exports.FamilyRelationshipType = void 0;
const graphql_1 = require("@nestjs/graphql");
const graphql_2 = require("@nestjs/graphql");
const member_entity_1 = require("./member.entity");
const graphql_type_json_1 = require("graphql-type-json");
var FamilyRelationshipType;
(function (FamilyRelationshipType) {
    FamilyRelationshipType["SPOUSE"] = "SPOUSE";
    FamilyRelationshipType["PARENT"] = "PARENT";
    FamilyRelationshipType["CHILD"] = "CHILD";
    FamilyRelationshipType["SIBLING"] = "SIBLING";
    FamilyRelationshipType["GRANDPARENT"] = "GRANDPARENT";
    FamilyRelationshipType["GRANDCHILD"] = "GRANDCHILD";
    FamilyRelationshipType["OTHER"] = "OTHER";
})(FamilyRelationshipType || (exports.FamilyRelationshipType = FamilyRelationshipType = {}));
(0, graphql_1.registerEnumType)(FamilyRelationshipType, {
    name: 'FamilyRelationshipType',
    description: 'Type of family relationship',
});
let Family = class Family {
    id;
    name;
    address;
    city;
    state;
    postalCode;
    country;
    phoneNumber;
    members;
    customFields;
    createdAt;
    updatedAt;
};
exports.Family = Family;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], Family.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], Family.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], Family.prototype, "address", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], Family.prototype, "city", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], Family.prototype, "state", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], Family.prototype, "postalCode", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], Family.prototype, "country", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", String)
], Family.prototype, "phoneNumber", void 0);
__decorate([
    (0, graphql_1.Field)(() => [member_entity_1.Member], { nullable: true }),
    __metadata("design:type", Array)
], Family.prototype, "members", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSON, { nullable: true }),
    __metadata("design:type", Object)
], Family.prototype, "customFields", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_2.GraphQLISODateTime),
    __metadata("design:type", Date)
], Family.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_2.GraphQLISODateTime),
    __metadata("design:type", Date)
], Family.prototype, "updatedAt", void 0);
exports.Family = Family = __decorate([
    (0, graphql_1.ObjectType)()
], Family);
let FamilyRelationship = class FamilyRelationship {
    id;
    member;
    memberId;
    relatedMember;
    relatedMemberId;
    relationshipType;
    family;
    familyId;
    createdAt;
    updatedAt;
};
exports.FamilyRelationship = FamilyRelationship;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], FamilyRelationship.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => member_entity_1.Member, { nullable: true }),
    __metadata("design:type", member_entity_1.Member)
], FamilyRelationship.prototype, "member", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], FamilyRelationship.prototype, "memberId", void 0);
__decorate([
    (0, graphql_1.Field)(() => member_entity_1.Member),
    __metadata("design:type", member_entity_1.Member)
], FamilyRelationship.prototype, "relatedMember", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], FamilyRelationship.prototype, "relatedMemberId", void 0);
__decorate([
    (0, graphql_1.Field)(() => FamilyRelationshipType),
    __metadata("design:type", String)
], FamilyRelationship.prototype, "relationshipType", void 0);
__decorate([
    (0, graphql_1.Field)(() => Family, { nullable: true }),
    __metadata("design:type", Family)
], FamilyRelationship.prototype, "family", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID, { nullable: true }),
    __metadata("design:type", String)
], FamilyRelationship.prototype, "familyId", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_2.GraphQLISODateTime),
    __metadata("design:type", Date)
], FamilyRelationship.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_2.GraphQLISODateTime),
    __metadata("design:type", Date)
], FamilyRelationship.prototype, "updatedAt", void 0);
exports.FamilyRelationship = FamilyRelationship = __decorate([
    (0, graphql_1.ObjectType)()
], FamilyRelationship);
//# sourceMappingURL=family.entity.js.map