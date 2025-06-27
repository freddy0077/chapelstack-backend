"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../prisma/prisma.module");
const speakers_service_1 = require("./services/speakers.service");
const series_service_1 = require("./services/series.service");
const sermons_service_1 = require("./services/sermons.service");
const media_items_service_1 = require("./services/media-items.service");
const s3_upload_service_1 = require("./services/s3-upload.service");
const speakers_resolver_1 = require("./resolvers/speakers.resolver");
const series_resolver_1 = require("./resolvers/series.resolver");
const sermons_resolver_1 = require("./resolvers/sermons.resolver");
const media_items_resolver_1 = require("./resolvers/media-items.resolver");
const file_upload_resolver_1 = require("./resolvers/file-upload.resolver");
let ContentModule = class ContentModule {
};
exports.ContentModule = ContentModule;
exports.ContentModule = ContentModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        providers: [
            speakers_service_1.SpeakersService,
            series_service_1.SeriesService,
            sermons_service_1.SermonsService,
            media_items_service_1.MediaItemsService,
            s3_upload_service_1.S3UploadService,
            speakers_resolver_1.SpeakersResolver,
            series_resolver_1.SeriesResolver,
            sermons_resolver_1.SermonsResolver,
            media_items_resolver_1.MediaItemsResolver,
            file_upload_resolver_1.FileUploadResolver,
        ],
        exports: [
            speakers_service_1.SpeakersService,
            series_service_1.SeriesService,
            sermons_service_1.SermonsService,
            media_items_service_1.MediaItemsService,
            s3_upload_service_1.S3UploadService,
        ],
    })
], ContentModule);
//# sourceMappingURL=content.module.js.map