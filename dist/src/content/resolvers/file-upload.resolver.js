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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileUploadResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const s3_upload_service_1 = require("../services/s3-upload.service");
const file_upload_input_1 = require("../dto/file-upload.input");
const media_type_enum_1 = require("../enums/media-type.enum");
const file_upload_response_1 = require("../dto/file-upload.response");
const media_items_service_1 = require("../services/media-items.service");
let FileUploadResolver = class FileUploadResolver {
    s3UploadService;
    mediaItemsService;
    constructor(s3UploadService, mediaItemsService) {
        this.s3UploadService = s3UploadService;
        this.mediaItemsService = mediaItemsService;
    }
    async getPresignedUploadUrl(input) {
        let directory = input.directory || 'general';
        if (!input.directory) {
            switch (input.mediaType) {
                case media_type_enum_1.MediaType.AUDIO_FILE:
                    directory = 'audio';
                    break;
                case media_type_enum_1.MediaType.VIDEO:
                    directory = 'video';
                    break;
                case media_type_enum_1.MediaType.IMAGE:
                    directory = 'images';
                    break;
                case media_type_enum_1.MediaType.DOCUMENT_PDF:
                case media_type_enum_1.MediaType.DOCUMENT_WORD:
                    directory = 'documents';
                    break;
                case media_type_enum_1.MediaType.SLIDESHOW:
                    directory = 'presentations';
                    break;
                default:
                    directory = 'other';
            }
        }
        const { uploadUrl, fileUrl } = await this.s3UploadService.generatePresignedUploadUrl(input.fileName, input.contentType, directory);
        const mediaItem = await this.mediaItemsService.create({
            title: input.fileName,
            description: input.description,
            fileUrl,
            mimeType: input.contentType,
            fileSize: 0,
            type: input.mediaType,
            branchId: input.branchId,
            uploadedBy: 'system',
        });
        if (!mediaItem || !mediaItem.id) {
            throw new Error('Failed to create media item record');
        }
        return {
            uploadUrl,
            fileUrl,
            mediaItemId: mediaItem.id,
        };
    }
    async deleteFile(id) {
        try {
            const mediaItem = await this.mediaItemsService.findOne(id);
            if (!mediaItem) {
                throw new Error(`Media item with id ${id} not found`);
            }
            if (!mediaItem.fileUrl) {
                throw new Error(`Media item with id ${id} has no file URL`);
            }
            const success = await this.s3UploadService.deleteFile(mediaItem.fileUrl);
            if (!success) {
                throw new Error(`Failed to delete file from S3: ${mediaItem.fileUrl}`);
            }
            await this.mediaItemsService.remove(id);
            return true;
        }
        catch (error) {
            console.error('Error deleting file:', error);
            throw error;
        }
    }
};
exports.FileUploadResolver = FileUploadResolver;
__decorate([
    (0, graphql_1.Mutation)(() => file_upload_response_1.FileUploadResponse),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [file_upload_input_1.FileUploadInput]),
    __metadata("design:returntype", Promise)
], FileUploadResolver.prototype, "getPresignedUploadUrl", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FileUploadResolver.prototype, "deleteFile", null);
exports.FileUploadResolver = FileUploadResolver = __decorate([
    (0, graphql_1.Resolver)(),
    __metadata("design:paramtypes", [s3_upload_service_1.S3UploadService,
        media_items_service_1.MediaItemsService])
], FileUploadResolver);
//# sourceMappingURL=file-upload.resolver.js.map