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
exports.S3Service = void 0;
const common_1 = require("@nestjs/common");
const client_s3_1 = require("@aws-sdk/client-s3");
const config_1 = require("@nestjs/config");
const uuid_1 = require("uuid");
let S3Service = class S3Service {
    configService;
    s3;
    bucket;
    constructor(configService) {
        this.configService = configService;
        const region = this.configService.get('AWS_S3_REGION');
        const accessKeyId = this.configService.get('AWS_S3_ACCESS_KEY_ID');
        const secretAccessKey = this.configService.get('AWS_S3_SECRET_ACCESS_KEY');
        if (region && accessKeyId && secretAccessKey) {
            this.s3 = new client_s3_1.S3Client({
                region,
                credentials: {
                    accessKeyId,
                    secretAccessKey,
                },
            });
        }
        else {
            throw new Error('Missing AWS S3 credentials');
        }
        this.bucket = this.configService.get('AWS_S3_BUCKET');
        if (!this.bucket) {
            throw new Error('Missing AWS S3 bucket');
        }
    }
    async uploadFile(file, folder = 'branding') {
        const fileKey = `${folder}/${(0, uuid_1.v4)()}-${file.originalname}`;
        await this.s3.send(new client_s3_1.PutObjectCommand({
            Bucket: this.bucket,
            Key: fileKey,
            Body: file.buffer,
            ContentType: file.mimetype,
        }));
        return `https://${this.bucket}.s3.${this.configService.get('AWS_S3_REGION')}.amazonaws.com/${fileKey}`;
    }
};
exports.S3Service = S3Service;
exports.S3Service = S3Service = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], S3Service);
//# sourceMappingURL=s3.service.js.map