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
exports.OrganisationResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const organisation_service_1 = require("./organisation.service");
const organisation_model_1 = require("./dto/organisation.model");
const create_organisation_input_1 = require("./dto/create-organisation.input");
const update_organisation_input_1 = require("./dto/update-organisation.input");
const graphql_upload_1 = require("graphql-upload");
const s3_service_1 = require("./services/s3.service");
let OrganisationResolver = class OrganisationResolver {
    organisationService;
    s3Service;
    constructor(organisationService, s3Service) {
        this.organisationService = organisationService;
        this.s3Service = s3Service;
    }
    findAll() {
        return this.organisationService.findAll();
    }
    findOne(id) {
        return this.organisationService.findOne(id);
    }
    createOrganisation(input) {
        return this.organisationService.create(input);
    }
    updateOrganisation(input) {
        return this.organisationService.update(input.id, input);
    }
    deleteOrganisation(id) {
        return this.organisationService.delete(id);
    }
    async uploadOrganisationBrandingFile(organisationId, file) {
        const { createReadStream, mimetype, filename } = await file;
        const chunks = [];
        const stream = createReadStream();
        for await (const chunk of stream) {
            chunks.push(chunk);
        }
        const buffer = Buffer.concat(chunks);
        const fileObj = {
            originalname: filename,
            mimetype,
            buffer,
        };
        return this.s3Service.uploadFile(fileObj);
    }
};
exports.OrganisationResolver = OrganisationResolver;
__decorate([
    (0, graphql_1.Query)(() => [organisation_model_1.Organisation], { name: 'organisations' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], OrganisationResolver.prototype, "findAll", null);
__decorate([
    (0, graphql_1.Query)(() => organisation_model_1.Organisation, { name: 'organisation', nullable: true }),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OrganisationResolver.prototype, "findOne", null);
__decorate([
    (0, graphql_1.Mutation)(() => organisation_model_1.Organisation),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_organisation_input_1.CreateOrganisationInput]),
    __metadata("design:returntype", void 0)
], OrganisationResolver.prototype, "createOrganisation", null);
__decorate([
    (0, graphql_1.Mutation)(() => organisation_model_1.Organisation),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_organisation_input_1.UpdateOrganisationInput]),
    __metadata("design:returntype", void 0)
], OrganisationResolver.prototype, "updateOrganisation", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OrganisationResolver.prototype, "deleteOrganisation", null);
__decorate([
    (0, graphql_1.Mutation)(() => String),
    __param(0, (0, graphql_1.Args)('organisationId', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)({ name: 'file', type: () => graphql_upload_1.GraphQLUpload })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_a = typeof graphql_upload_1.FileUpload !== "undefined" && graphql_upload_1.FileUpload) === "function" ? _a : Object]),
    __metadata("design:returntype", Promise)
], OrganisationResolver.prototype, "uploadOrganisationBrandingFile", null);
exports.OrganisationResolver = OrganisationResolver = __decorate([
    (0, graphql_1.Resolver)(() => organisation_model_1.Organisation),
    __metadata("design:paramtypes", [organisation_service_1.OrganisationService,
        s3_service_1.S3Service])
], OrganisationResolver);
//# sourceMappingURL=organisation.resolver.js.map