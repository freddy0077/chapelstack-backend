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
exports.CreateEventInput = void 0;
const graphql_1 = require("@nestjs/graphql");
const graphql_2 = require("@nestjs/graphql");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
let CreateEventInput = class CreateEventInput {
    title;
    description;
    startDate;
    endDate;
    location;
    category;
    branchId;
    organisationId;
};
exports.CreateEventInput = CreateEventInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Title is required' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEventInput.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEventInput.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_2.GraphQLISODateTime),
    (0, class_validator_1.IsNotEmpty)({ message: 'Start date is required' }),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], CreateEventInput.prototype, "startDate", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_2.GraphQLISODateTime, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], CreateEventInput.prototype, "endDate", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEventInput.prototype, "location", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEventInput.prototype, "category", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateEventInput.prototype, "branchId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateEventInput.prototype, "organisationId", void 0);
exports.CreateEventInput = CreateEventInput = __decorate([
    (0, graphql_1.InputType)()
], CreateEventInput);
//# sourceMappingURL=create-event.input.js.map