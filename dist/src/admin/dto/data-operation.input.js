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
exports.DataOperationFilterInput = exports.CreateDataExportInput = exports.CreateDataImportInput = void 0;
const graphql_1 = require("@nestjs/graphql");
const class_validator_1 = require("class-validator");
const data_operation_entity_1 = require("../entities/data-operation.entity");
const graphql_type_json_1 = require("graphql-type-json");
let CreateDataImportInput = class CreateDataImportInput {
    entityType;
    description;
    metadata;
    filePath;
    userId;
};
exports.CreateDataImportInput = CreateDataImportInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDataImportInput.prototype, "entityType", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDataImportInput.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSON, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateDataImportInput.prototype, "metadata", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDataImportInput.prototype, "filePath", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateDataImportInput.prototype, "userId", void 0);
exports.CreateDataImportInput = CreateDataImportInput = __decorate([
    (0, graphql_1.InputType)()
], CreateDataImportInput);
let CreateDataExportInput = class CreateDataExportInput {
    entityType;
    description;
    metadata;
    userId;
};
exports.CreateDataExportInput = CreateDataExportInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDataExportInput.prototype, "entityType", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDataExportInput.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSON, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateDataExportInput.prototype, "metadata", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateDataExportInput.prototype, "userId", void 0);
exports.CreateDataExportInput = CreateDataExportInput = __decorate([
    (0, graphql_1.InputType)()
], CreateDataExportInput);
let DataOperationFilterInput = class DataOperationFilterInput {
    id;
    type;
    entityType;
    userId;
    status;
    startDate;
    endDate;
};
exports.DataOperationFilterInput = DataOperationFilterInput;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], DataOperationFilterInput.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => data_operation_entity_1.DataOperationType, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(data_operation_entity_1.DataOperationType),
    __metadata("design:type", String)
], DataOperationFilterInput.prototype, "type", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DataOperationFilterInput.prototype, "entityType", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], DataOperationFilterInput.prototype, "userId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DataOperationFilterInput.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DataOperationFilterInput.prototype, "startDate", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DataOperationFilterInput.prototype, "endDate", void 0);
exports.DataOperationFilterInput = DataOperationFilterInput = __decorate([
    (0, graphql_1.InputType)()
], DataOperationFilterInput);
//# sourceMappingURL=data-operation.input.js.map