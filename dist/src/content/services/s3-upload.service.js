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
exports.S3UploadService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const uuid_1 = require("uuid");
let S3UploadService = class S3UploadService {
    configService;
    s3Client;
    bucketName;
    region;
    baseUrl;
    constructor(configService) {
        this.configService = configService;
        this.region =
            this.configService.get('AWS_S3_REGION') || 'us-east-1';
        this.bucketName =
            this.configService.get('AWS_S3_BUCKET_NAME') || 'default-bucket';
        const accessKeyId = this.configService.get('AWS_ACCESS_KEY_ID') || 'default-key';
        const secretAccessKey = this.configService.get('AWS_SECRET_ACCESS_KEY') ||
            'default-secret';
        this.s3Client = new client_s3_1.S3Client({
            region: this.region,
            credentials: {
                accessKeyId,
                secretAccessKey,
            },
        });
        this.baseUrl = `https://${this.bucketName}.s3.${this.region}.amazonaws.com`;
    }
    async generatePresignedUploadUrl(fileName, contentType, directory = 'general') {
        const fileExtension = fileName.split('.').pop();
        const uniqueFileName = `${directory}/${(0, uuid_1.v4)()}.${fileExtension}`;
        const command = new client_s3_1.PutObjectCommand({
            Bucket: this.bucketName,
            Key: uniqueFileName,
            ContentType: contentType,
        });
        const uploadUrl = await (0, s3_request_presigner_1.getSignedUrl)(this.s3Client, command, {
            expiresIn: 900,
        });
        return {
            uploadUrl,
            fileUrl: `${this.baseUrl}/${uniqueFileName}`,
        };
    }
    async deleteFile(fileUrl) {
        try {
            const key = fileUrl.replace(`${this.baseUrl}/`, '');
            const command = new client_s3_1.DeleteObjectCommand({
                Bucket: this.bucketName,
                Key: key,
            });
            await this.s3Client.send(command);
            return true;
        }
        catch (error) {
            console.error('Error deleting file from S3:', error);
            return false;
        }
    }
    getFileUrl(key) {
        return `${this.baseUrl}/${key}`;
    }
};
exports.S3UploadService = S3UploadService;
exports.S3UploadService = S3UploadService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], S3UploadService);
//# sourceMappingURL=s3-upload.service.js.map