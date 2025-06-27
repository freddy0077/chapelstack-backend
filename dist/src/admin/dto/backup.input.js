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
exports.BackupFilterInput = exports.RestoreBackupInput = exports.CreateBackupInput = void 0;
const graphql_1 = require("@nestjs/graphql");
const class_validator_1 = require("class-validator");
const backup_entity_1 = require("../entities/backup.entity");
const graphql_type_json_1 = require("graphql-type-json");
let CreateBackupInput = class CreateBackupInput {
    type;
    description;
    metadata;
    userId;
};
exports.CreateBackupInput = CreateBackupInput;
__decorate([
    (0, graphql_1.Field)(() => backup_entity_1.BackupType),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEnum)(backup_entity_1.BackupType),
    __metadata("design:type", String)
], CreateBackupInput.prototype, "type", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBackupInput.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSON, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateBackupInput.prototype, "metadata", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateBackupInput.prototype, "userId", void 0);
exports.CreateBackupInput = CreateBackupInput = __decorate([
    (0, graphql_1.InputType)()
], CreateBackupInput);
let RestoreBackupInput = class RestoreBackupInput {
    backupId;
    description;
    metadata;
    userId;
};
exports.RestoreBackupInput = RestoreBackupInput;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], RestoreBackupInput.prototype, "backupId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RestoreBackupInput.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSON, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], RestoreBackupInput.prototype, "metadata", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], RestoreBackupInput.prototype, "userId", void 0);
exports.RestoreBackupInput = RestoreBackupInput = __decorate([
    (0, graphql_1.InputType)()
], RestoreBackupInput);
let BackupFilterInput = class BackupFilterInput {
    id;
    type;
    status;
    userId;
    startDate;
    endDate;
    createdAfter;
    createdBefore;
};
exports.BackupFilterInput = BackupFilterInput;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], BackupFilterInput.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => backup_entity_1.BackupType, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(backup_entity_1.BackupType),
    __metadata("design:type", String)
], BackupFilterInput.prototype, "type", void 0);
__decorate([
    (0, graphql_1.Field)(() => backup_entity_1.BackupStatus, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(backup_entity_1.BackupStatus),
    __metadata("design:type", String)
], BackupFilterInput.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], BackupFilterInput.prototype, "userId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BackupFilterInput.prototype, "startDate", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BackupFilterInput.prototype, "endDate", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BackupFilterInput.prototype, "createdAfter", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BackupFilterInput.prototype, "createdBefore", void 0);
exports.BackupFilterInput = BackupFilterInput = __decorate([
    (0, graphql_1.InputType)()
], BackupFilterInput);
//# sourceMappingURL=backup.input.js.map