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
exports.FundsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let FundsService = class FundsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    create(createFundInput) {
        const { branchId, organisationId, ...rest } = createFundInput;
        const data = { ...rest };
        if (branchId) {
            data.branch = { connect: { id: branchId } };
        }
        if (organisationId) {
            data.organisation = { connect: { id: organisationId } };
        }
        return this.prisma.fund.create({ data });
    }
    findAll(organisationId) {
        return this.prisma.fund.findMany({ where: { organisationId } });
    }
    findOne(id) {
        return this.prisma.fund.findUnique({ where: { id } });
    }
    update(id, updateFundInput) {
        const { id: _, branchId, organisationId, ...rest } = updateFundInput;
        const data = { ...rest };
        if (branchId) {
            data.branch = { connect: { id: branchId } };
        }
        if (organisationId) {
            data.organisation = { connect: { id: organisationId } };
        }
        return this.prisma.fund.update({
            where: { id },
            data,
        });
    }
    remove(id) {
        return this.prisma.fund.delete({ where: { id } });
    }
};
exports.FundsService = FundsService;
exports.FundsService = FundsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FundsService);
//# sourceMappingURL=funds.service.js.map