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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SacramentsResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const sacraments_service_1 = require("./sacraments.service");
const sacramental_record_entity_1 = require("./entities/sacramental-record.entity");
const create_sacramental_record_input_1 = require("./dto/create-sacramental-record.input");
const update_sacramental_record_input_1 = require("./dto/update-sacramental-record.input");
const sacramental_record_filter_input_1 = require("./dto/sacramental-record-filter.input");
const common_1 = require("@nestjs/common");
const sacrament_stats_output_1 = require("./dto/sacrament-stats.output");
const sacrament_anniversary_output_1 = require("./dto/sacrament-anniversary.output");
const graphql_upload_1 = require("graphql-upload");
const fs_1 = require("fs");
const path_1 = require("path");
const uuid_1 = require("uuid");
let SacramentsResolver = class SacramentsResolver {
    sacramentsService;
    constructor(sacramentsService) {
        this.sacramentsService = sacramentsService;
    }
    async sacramentStats(period, branchId) {
        return await this.sacramentsService.getSacramentStats(period, branchId);
    }
    async upcomingSacramentAnniversaries(limit, branchId) {
        return await this.sacramentsService.getUpcomingAnniversaries(limit, branchId);
    }
    async createSacramentalRecord(createSacramentalRecordInput) {
        try {
            const result = await this.sacramentsService.create(createSacramentalRecordInput);
            if (!result)
                throw new Error('Failed to create sacramental record');
            return result;
        }
        catch (err) {
            throw new Error('Failed to create sacramental record: ' +
                (err instanceof Error ? err.message : String(err)));
        }
    }
    async findAll(filter) {
        try {
            const result = await this.sacramentsService.findAll(filter);
            if (!result)
                throw new Error('Failed to find sacramental records');
            return result;
        }
        catch (err) {
            throw new Error('Failed to find sacramental records: ' +
                (err instanceof Error ? err.message : String(err)));
        }
    }
    async findOne(id) {
        try {
            const result = await this.sacramentsService.findOne(id);
            if (!result)
                throw new Error('Failed to find sacramental record');
            return result;
        }
        catch (err) {
            throw new Error('Failed to find sacramental record: ' +
                (err instanceof Error ? err.message : String(err)));
        }
    }
    async findByMember(memberId) {
        try {
            const result = await this.sacramentsService.findByMember(memberId);
            if (!result)
                throw new Error('Failed to find sacraments by member');
            return result;
        }
        catch (err) {
            throw new Error('Failed to find sacraments by member: ' +
                (err instanceof Error ? err.message : String(err)));
        }
    }
    async updateSacramentalRecord(updateSacramentalRecordInput) {
        try {
            const result = await this.sacramentsService.update(updateSacramentalRecordInput.id, updateSacramentalRecordInput);
            if (!result)
                throw new Error('Failed to update sacramental record');
            return result;
        }
        catch (err) {
            throw new Error('Failed to update sacramental record: ' +
                (err instanceof Error ? err.message : String(err)));
        }
    }
    async deleteSacramentalRecord(id) {
        try {
            const result = await this.sacramentsService.remove(id);
            if (!result || typeof result !== 'object')
                throw new Error('Failed to delete sacramental record');
            return result;
        }
        catch (err) {
            throw new Error('Failed to delete sacramental record: ' +
                (err instanceof Error ? err.message : String(err)));
        }
    }
    async uploadSacramentalCertificate(recordId, file) {
        const { createReadStream, filename, mimetype } = await file;
        if (!mimetype.match(/^(image\/|application\/pdf)/)) {
            throw new Error('Invalid file type. Only images and PDFs are allowed.');
        }
        const fileExtension = filename.split('.').pop();
        const uniqueFilename = `${(0, uuid_1.v4)()}.${fileExtension}`;
        const uploadsDir = (0, path_1.join)(process.cwd(), 'uploads', 'certificates');
        const filePath = (0, path_1.join)(uploadsDir, uniqueFilename);
        const writeStream = (0, fs_1.createWriteStream)(filePath);
        createReadStream().pipe(writeStream);
        await new Promise((resolve, reject) => {
            writeStream.on('finish', () => resolve());
            writeStream.on('error', reject);
        });
        const certificateUrl = `/uploads/certificates/${uniqueFilename}`;
        try {
            const result = await this.sacramentsService.uploadCertificate(recordId, certificateUrl);
            if (!result)
                throw new Error('Failed to update certificate URL');
            return result;
        }
        catch (err) {
            throw new Error('Failed to upload certificate: ' +
                (err instanceof Error ? err.message : String(err)));
        }
    }
};
exports.SacramentsResolver = SacramentsResolver;
__decorate([
    (0, graphql_1.Query)(() => [sacrament_stats_output_1.SacramentStatsOutput], { name: 'sacramentStats' }),
    __param(0, (0, graphql_1.Args)('period', { nullable: true })),
    __param(1, (0, graphql_1.Args)('branchId', { type: () => graphql_1.ID, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SacramentsResolver.prototype, "sacramentStats", null);
__decorate([
    (0, graphql_1.Query)(() => [sacrament_anniversary_output_1.SacramentAnniversaryOutput], {
        name: 'upcomingSacramentAnniversaries',
    }),
    __param(0, (0, graphql_1.Args)('limit', { type: () => graphql_1.Int, nullable: true })),
    __param(1, (0, graphql_1.Args)('branchId', { type: () => graphql_1.ID, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], SacramentsResolver.prototype, "upcomingSacramentAnniversaries", null);
__decorate([
    (0, graphql_1.Mutation)(() => sacramental_record_entity_1.SacramentalRecord),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_sacramental_record_input_1.CreateSacramentalRecordInput]),
    __metadata("design:returntype", Promise)
], SacramentsResolver.prototype, "createSacramentalRecord", null);
__decorate([
    (0, graphql_1.Query)(() => [sacramental_record_entity_1.SacramentalRecord], { name: 'sacramentalRecords' }),
    __param(0, (0, graphql_1.Args)('filter', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [sacramental_record_filter_input_1.SacramentalRecordFilterInput]),
    __metadata("design:returntype", Promise)
], SacramentsResolver.prototype, "findAll", null);
__decorate([
    (0, graphql_1.Query)(() => sacramental_record_entity_1.SacramentalRecord, { name: 'sacramentalRecord' }),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID }, common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SacramentsResolver.prototype, "findOne", null);
__decorate([
    (0, graphql_1.Query)(() => [sacramental_record_entity_1.SacramentalRecord], { name: 'sacramentsByMember' }),
    __param(0, (0, graphql_1.Args)('memberId', { type: () => graphql_1.ID }, common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SacramentsResolver.prototype, "findByMember", null);
__decorate([
    (0, graphql_1.Mutation)(() => sacramental_record_entity_1.SacramentalRecord),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_sacramental_record_input_1.UpdateSacramentalRecordInput]),
    __metadata("design:returntype", Promise)
], SacramentsResolver.prototype, "updateSacramentalRecord", null);
__decorate([
    (0, graphql_1.Mutation)(() => sacramental_record_entity_1.SacramentalRecord),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID }, common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SacramentsResolver.prototype, "deleteSacramentalRecord", null);
__decorate([
    (0, graphql_1.Mutation)(() => sacramental_record_entity_1.SacramentalRecord),
    __param(0, (0, graphql_1.Args)('recordId', { type: () => graphql_1.ID }, common_1.ParseUUIDPipe)),
    __param(1, (0, graphql_1.Args)('file', { type: () => graphql_upload_1.GraphQLUpload })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_a = typeof graphql_upload_1.FileUpload !== "undefined" && graphql_upload_1.FileUpload) === "function" ? _a : Object]),
    __metadata("design:returntype", Promise)
], SacramentsResolver.prototype, "uploadSacramentalCertificate", null);
exports.SacramentsResolver = SacramentsResolver = __decorate([
    (0, graphql_1.Resolver)(() => sacramental_record_entity_1.SacramentalRecord),
    __metadata("design:paramtypes", [sacraments_service_1.SacramentsService])
], SacramentsResolver);
//# sourceMappingURL=sacraments.resolver.js.map