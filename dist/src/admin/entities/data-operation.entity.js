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
exports.DataOperation = exports.DataOperationStatus = exports.DataOperationType = void 0;
const graphql_1 = require("@nestjs/graphql");
const user_entity_1 = require("../../auth/entities/user.entity");
const graphql_type_json_1 = require("graphql-type-json");
var DataOperationType;
(function (DataOperationType) {
    DataOperationType["IMPORT"] = "IMPORT";
    DataOperationType["EXPORT"] = "EXPORT";
})(DataOperationType || (exports.DataOperationType = DataOperationType = {}));
var DataOperationStatus;
(function (DataOperationStatus) {
    DataOperationStatus["PENDING"] = "PENDING";
    DataOperationStatus["IN_PROGRESS"] = "IN_PROGRESS";
    DataOperationStatus["COMPLETED"] = "COMPLETED";
    DataOperationStatus["FAILED"] = "FAILED";
    DataOperationStatus["CANCELLED"] = "CANCELLED";
})(DataOperationStatus || (exports.DataOperationStatus = DataOperationStatus = {}));
(0, graphql_1.registerEnumType)(DataOperationType, {
    name: 'DataOperationType',
    description: 'Type of data operation (import or export)',
});
(0, graphql_1.registerEnumType)(DataOperationStatus, {
    name: 'DataOperationStatus',
    description: 'Status of a data operation',
});
let DataOperation = class DataOperation {
    id;
    type;
    status;
    entityType;
    description;
    metadata;
    filePath;
    fileSize;
    recordCount;
    errorCount;
    errors;
    userId;
    user;
    createdAt;
    completedAt;
};
exports.DataOperation = DataOperation;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], DataOperation.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => DataOperationType),
    __metadata("design:type", String)
], DataOperation.prototype, "type", void 0);
__decorate([
    (0, graphql_1.Field)(() => DataOperationStatus),
    __metadata("design:type", String)
], DataOperation.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], DataOperation.prototype, "entityType", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], DataOperation.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSON, { nullable: true }),
    __metadata("design:type", Object)
], DataOperation.prototype, "metadata", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], DataOperation.prototype, "filePath", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Number)
], DataOperation.prototype, "fileSize", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Number)
], DataOperation.prototype, "recordCount", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Number)
], DataOperation.prototype, "errorCount", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSON, { nullable: true }),
    __metadata("design:type", Array)
], DataOperation.prototype, "errors", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID, { nullable: true }),
    __metadata("design:type", String)
], DataOperation.prototype, "userId", void 0);
__decorate([
    (0, graphql_1.Field)(() => user_entity_1.User, { nullable: true }),
    __metadata("design:type", user_entity_1.User)
], DataOperation.prototype, "user", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.GraphQLISODateTime),
    __metadata("design:type", Date)
], DataOperation.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.GraphQLISODateTime, { nullable: true }),
    __metadata("design:type", Date)
], DataOperation.prototype, "completedAt", void 0);
exports.DataOperation = DataOperation = __decorate([
    (0, graphql_1.ObjectType)()
], DataOperation);
//# sourceMappingURL=data-operation.entity.js.map