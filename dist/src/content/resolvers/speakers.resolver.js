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
exports.SpeakersResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const speakers_service_1 = require("../services/speakers.service");
const create_speaker_input_1 = require("../dto/create-speaker.input");
const update_speaker_input_1 = require("../dto/update-speaker.input");
const speaker_entity_1 = require("../entities/speaker.entity");
const speaker_mapper_1 = require("../mappers/speaker.mapper");
let SpeakersResolver = class SpeakersResolver {
    speakersService;
    constructor(speakersService) {
        this.speakersService = speakersService;
    }
    async create(createSpeakerInput) {
        const speaker = await this.speakersService.create(createSpeakerInput);
        return (0, speaker_mapper_1.mapToSpeakerEntity)(speaker);
    }
    async findAll(branchId) {
        const speakers = await this.speakersService.findAll(branchId);
        return (0, speaker_mapper_1.mapToSpeakerEntities)(speakers);
    }
    async findOne(id) {
        const speaker = await this.speakersService.findOne(id);
        return (0, speaker_mapper_1.mapToSpeakerEntity)(speaker);
    }
    async update(updateSpeakerInput) {
        const speaker = await this.speakersService.update(updateSpeakerInput);
        return (0, speaker_mapper_1.mapToSpeakerEntity)(speaker);
    }
    async remove(id) {
        const speaker = await this.speakersService.remove(id);
        return (0, speaker_mapper_1.mapToSpeakerEntity)(speaker);
    }
    async findByMember(memberId) {
        const speaker = await this.speakersService.findByMember(memberId);
        return speaker ? (0, speaker_mapper_1.mapToSpeakerEntity)(speaker) : null;
    }
};
exports.SpeakersResolver = SpeakersResolver;
__decorate([
    (0, graphql_1.Mutation)(() => speaker_entity_1.SpeakerEntity),
    __param(0, (0, graphql_1.Args)('createSpeakerInput')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_speaker_input_1.CreateSpeakerInput]),
    __metadata("design:returntype", Promise)
], SpeakersResolver.prototype, "create", null);
__decorate([
    (0, graphql_1.Query)(() => [speaker_entity_1.SpeakerEntity]),
    __param(0, (0, graphql_1.Args)('branchId', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SpeakersResolver.prototype, "findAll", null);
__decorate([
    (0, graphql_1.Query)(() => speaker_entity_1.SpeakerEntity),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SpeakersResolver.prototype, "findOne", null);
__decorate([
    (0, graphql_1.Mutation)(() => speaker_entity_1.SpeakerEntity),
    __param(0, (0, graphql_1.Args)('updateSpeakerInput')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_speaker_input_1.UpdateSpeakerInput]),
    __metadata("design:returntype", Promise)
], SpeakersResolver.prototype, "update", null);
__decorate([
    (0, graphql_1.Mutation)(() => speaker_entity_1.SpeakerEntity),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SpeakersResolver.prototype, "remove", null);
__decorate([
    (0, graphql_1.Query)(() => speaker_entity_1.SpeakerEntity, { nullable: true }),
    __param(0, (0, graphql_1.Args)('memberId', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SpeakersResolver.prototype, "findByMember", null);
exports.SpeakersResolver = SpeakersResolver = __decorate([
    (0, graphql_1.Resolver)(() => speaker_entity_1.SpeakerEntity),
    __metadata("design:paramtypes", [speakers_service_1.SpeakersService])
], SpeakersResolver);
//# sourceMappingURL=speakers.resolver.js.map