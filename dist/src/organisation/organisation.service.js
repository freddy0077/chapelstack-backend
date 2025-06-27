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
exports.OrganisationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let OrganisationService = class OrganisationService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.organisation.findMany();
    }
    async findOne(id) {
        return this.prisma.organisation.findUnique({ where: { id } });
    }
    async create(input) {
        return this.prisma.organisation.create({
            data: {
                name: input.name,
                email: input.email,
                phoneNumber: input.phoneNumber,
                website: input.website,
                address: input.address,
                city: input.city,
                state: input.state,
                country: input.country,
                zipCode: input.zipCode,
                denomination: input.denomination,
                foundingYear: input.foundingYear,
                size: input.size,
                vision: input.vision,
                missionStatement: input.missionStatement,
                description: input.description,
                timezone: input.timezone,
                currency: input.currency,
                primaryColor: input.primaryColor,
                secondaryColor: input.secondaryColor,
            },
        });
    }
    async update(id, input) {
        return this.prisma.organisation.update({ where: { id }, data: input });
    }
    async delete(id) {
        await this.prisma.organisation.delete({ where: { id } });
        return true;
    }
};
exports.OrganisationService = OrganisationService;
exports.OrganisationService = OrganisationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrganisationService);
//# sourceMappingURL=organisation.service.js.map