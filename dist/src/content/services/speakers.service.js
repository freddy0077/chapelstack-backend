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
exports.SpeakersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let SpeakersService = class SpeakersService {
    prisma;
    async countAll() {
        return 0;
    }
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createSpeakerInput) {
        return this.prisma.speaker.create({
            data: {
                name: createSpeakerInput.name,
                bio: createSpeakerInput.bio,
                memberId: createSpeakerInput.memberId,
                imageUrl: createSpeakerInput.imageUrl,
                branchId: createSpeakerInput.branchId,
            },
        });
    }
    async findAll(branchId) {
        const where = branchId ? { branchId } : {};
        return this.prisma.speaker.findMany({
            where,
            include: {
                member: true,
                sermons: true,
            },
        });
    }
    async findOne(id) {
        const speaker = await this.prisma.speaker.findUnique({
            where: { id },
            include: {
                member: true,
                sermons: true,
            },
        });
        if (!speaker) {
            throw new common_1.NotFoundException(`Speaker with ID ${id} not found`);
        }
        return speaker;
    }
    async update(updateSpeakerInput) {
        const { id, ...data } = updateSpeakerInput;
        await this.findOne(id);
        return this.prisma.speaker.update({
            where: { id },
            data,
            include: {
                member: true,
                sermons: true,
            },
        });
    }
    async remove(id) {
        await this.findOne(id);
        const speakerWithSermons = await this.prisma.speaker.findUnique({
            where: { id },
            include: {
                sermons: {
                    take: 1,
                },
            },
        });
        if (speakerWithSermons && speakerWithSermons.sermons.length > 0) {
            throw new Error(`Cannot delete speaker with ID ${id} because they have associated sermons`);
        }
        return this.prisma.speaker.delete({
            where: { id },
        });
    }
    async findByMember(memberId) {
        return this.prisma.speaker.findUnique({
            where: { memberId },
            include: {
                sermons: true,
            },
        });
    }
};
exports.SpeakersService = SpeakersService;
exports.SpeakersService = SpeakersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SpeakersService);
//# sourceMappingURL=speakers.service.js.map