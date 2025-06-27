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
exports.SmallGroupFilterInput = exports.UpdateSmallGroupInput = exports.CreateSmallGroupInput = exports.SmallGroupStatus = exports.SmallGroupType = void 0;
const graphql_1 = require("@nestjs/graphql");
const class_validator_1 = require("class-validator");
var SmallGroupType;
(function (SmallGroupType) {
    SmallGroupType["BIBLE_STUDY"] = "BIBLE_STUDY";
    SmallGroupType["PRAYER"] = "PRAYER";
    SmallGroupType["INTEREST_BASED"] = "INTEREST_BASED";
    SmallGroupType["DISCIPLESHIP"] = "DISCIPLESHIP";
    SmallGroupType["SUPPORT"] = "SUPPORT";
    SmallGroupType["FELLOWSHIP"] = "FELLOWSHIP";
    SmallGroupType["OTHER"] = "OTHER";
})(SmallGroupType || (exports.SmallGroupType = SmallGroupType = {}));
var SmallGroupStatus;
(function (SmallGroupStatus) {
    SmallGroupStatus["ACTIVE"] = "ACTIVE";
    SmallGroupStatus["INACTIVE"] = "INACTIVE";
    SmallGroupStatus["FULL"] = "FULL";
})(SmallGroupStatus || (exports.SmallGroupStatus = SmallGroupStatus = {}));
let CreateSmallGroupInput = class CreateSmallGroupInput {
    name;
    description;
    type;
    meetingSchedule;
    location;
    maximumCapacity;
    status;
    branchId;
    ministryId;
};
exports.CreateSmallGroupInput = CreateSmallGroupInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateSmallGroupInput.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateSmallGroupInput.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsEnum)(SmallGroupType),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateSmallGroupInput.prototype, "type", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateSmallGroupInput.prototype, "meetingSchedule", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateSmallGroupInput.prototype, "location", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateSmallGroupInput.prototype, "maximumCapacity", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsEnum)(SmallGroupStatus),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateSmallGroupInput.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateSmallGroupInput.prototype, "branchId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateSmallGroupInput.prototype, "ministryId", void 0);
exports.CreateSmallGroupInput = CreateSmallGroupInput = __decorate([
    (0, graphql_1.InputType)()
], CreateSmallGroupInput);
let UpdateSmallGroupInput = class UpdateSmallGroupInput {
    name;
    description;
    type;
    meetingSchedule;
    location;
    maximumCapacity;
    status;
    branchId;
    ministryId;
};
exports.UpdateSmallGroupInput = UpdateSmallGroupInput;
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateSmallGroupInput.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateSmallGroupInput.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsEnum)(SmallGroupType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateSmallGroupInput.prototype, "type", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateSmallGroupInput.prototype, "meetingSchedule", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateSmallGroupInput.prototype, "location", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateSmallGroupInput.prototype, "maximumCapacity", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsEnum)(SmallGroupStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateSmallGroupInput.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateSmallGroupInput.prototype, "branchId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateSmallGroupInput.prototype, "ministryId", void 0);
exports.UpdateSmallGroupInput = UpdateSmallGroupInput = __decorate([
    (0, graphql_1.InputType)()
], UpdateSmallGroupInput);
let SmallGroupFilterInput = class SmallGroupFilterInput {
    id;
    name;
    type;
    status;
    branchId;
    organisationId;
    ministryId;
    search;
};
exports.SmallGroupFilterInput = SmallGroupFilterInput;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID, { nullable: true }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SmallGroupFilterInput.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SmallGroupFilterInput.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsEnum)(SmallGroupType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SmallGroupFilterInput.prototype, "type", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsEnum)(SmallGroupStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SmallGroupFilterInput.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SmallGroupFilterInput.prototype, "branchId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SmallGroupFilterInput.prototype, "organisationId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SmallGroupFilterInput.prototype, "ministryId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SmallGroupFilterInput.prototype, "search", void 0);
exports.SmallGroupFilterInput = SmallGroupFilterInput = __decorate([
    (0, graphql_1.InputType)()
], SmallGroupFilterInput);
//# sourceMappingURL=small-group.input.js.map