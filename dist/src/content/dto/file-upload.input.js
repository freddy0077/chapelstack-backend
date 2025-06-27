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
exports.FileUploadInput = void 0;
const graphql_1 = require("@nestjs/graphql");
const class_validator_1 = require("class-validator");
const media_type_enum_1 = require("../enums/media-type.enum");
let FileUploadInput = class FileUploadInput {
    fileName;
    contentType;
    mediaType;
    description;
    branchId;
    directory;
};
exports.FileUploadInput = FileUploadInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FileUploadInput.prototype, "fileName", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FileUploadInput.prototype, "contentType", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEnum)(media_type_enum_1.MediaType, {
        message: 'mediaType must be a valid MediaType: AUDIO_FILE, VIDEO, IMAGE, DOCUMENT_PDF, DOCUMENT_WORD, SLIDESHOW, OTHER',
    }),
    __metadata("design:type", String)
], FileUploadInput.prototype, "mediaType", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FileUploadInput.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], FileUploadInput.prototype, "branchId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FileUploadInput.prototype, "directory", void 0);
exports.FileUploadInput = FileUploadInput = __decorate([
    (0, graphql_1.InputType)()
], FileUploadInput);
//# sourceMappingURL=file-upload.input.js.map