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
exports.Backup = exports.BackupType = exports.BackupStatus = void 0;
const graphql_1 = require("@nestjs/graphql");
const user_entity_1 = require("../../auth/entities/user.entity");
const graphql_type_json_1 = require("graphql-type-json");
var BackupStatus;
(function (BackupStatus) {
    BackupStatus["PENDING"] = "PENDING";
    BackupStatus["IN_PROGRESS"] = "IN_PROGRESS";
    BackupStatus["COMPLETED"] = "COMPLETED";
    BackupStatus["FAILED"] = "FAILED";
})(BackupStatus || (exports.BackupStatus = BackupStatus = {}));
var BackupType;
(function (BackupType) {
    BackupType["FULL"] = "FULL";
    BackupType["INCREMENTAL"] = "INCREMENTAL";
    BackupType["SCHEDULED"] = "SCHEDULED";
    BackupType["MANUAL"] = "MANUAL";
})(BackupType || (exports.BackupType = BackupType = {}));
(0, graphql_1.registerEnumType)(BackupStatus, {
    name: 'BackupStatus',
    description: 'Status of a backup operation',
});
(0, graphql_1.registerEnumType)(BackupType, {
    name: 'BackupType',
    description: 'Type of backup operation',
});
let Backup = class Backup {
    id;
    type;
    status;
    description;
    metadata;
    filePath;
    fileSize;
    duration;
    errorDetails;
    userId;
    user;
    createdAt;
    completedAt;
};
exports.Backup = Backup;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], Backup.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => BackupType),
    __metadata("design:type", String)
], Backup.prototype, "type", void 0);
__decorate([
    (0, graphql_1.Field)(() => BackupStatus),
    __metadata("design:type", String)
], Backup.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], Backup.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSON, { nullable: true }),
    __metadata("design:type", Object)
], Backup.prototype, "metadata", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], Backup.prototype, "filePath", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Number)
], Backup.prototype, "fileSize", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Number)
], Backup.prototype, "duration", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.GraphQLJSON, { nullable: true }),
    __metadata("design:type", Object)
], Backup.prototype, "errorDetails", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID, { nullable: true }),
    __metadata("design:type", String)
], Backup.prototype, "userId", void 0);
__decorate([
    (0, graphql_1.Field)(() => user_entity_1.User, { nullable: true }),
    __metadata("design:type", user_entity_1.User)
], Backup.prototype, "user", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.GraphQLISODateTime),
    __metadata("design:type", Date)
], Backup.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.GraphQLISODateTime, { nullable: true }),
    __metadata("design:type", Date)
], Backup.prototype, "completedAt", void 0);
exports.Backup = Backup = __decorate([
    (0, graphql_1.ObjectType)()
], Backup);
//# sourceMappingURL=backup.entity.js.map