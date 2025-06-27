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
var SettingsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SettingsService = SettingsService_1 = class SettingsService {
    prisma;
    logger = new common_1.Logger(SettingsService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createSettingInput) {
        const { key, value, branchId } = createSettingInput;
        const effectiveBranchId = branchId === undefined ? null : branchId;
        const existingSetting = await this.prisma.setting.findFirst({
            where: {
                key,
                branchId: effectiveBranchId,
            },
        });
        if (existingSetting) {
            throw new common_1.ConflictException(`Setting with key '${key}'${effectiveBranchId ? ` for branch '${effectiveBranchId}'` : ' (global)'} already exists.`);
        }
        return this.prisma.setting.create({
            data: {
                key,
                value,
                branchId: effectiveBranchId,
            },
        });
    }
    async findAll(branchId, onlyGlobal = false) {
        if (branchId) {
            return this.prisma.setting.findMany({
                where: {
                    OR: [{ branchId: branchId }, { branchId: null }],
                },
                orderBy: [{ branchId: 'asc' }, { key: 'asc' }],
            });
        }
        else if (onlyGlobal) {
            return this.prisma.setting.findMany({
                where: { branchId: null },
                orderBy: [{ key: 'asc' }],
            });
        }
        else {
            return this.prisma.setting.findMany({
                orderBy: [{ branchId: 'asc' }, { key: 'asc' }],
            });
        }
    }
    async findOne(id) {
        const setting = await this.prisma.setting.findUnique({
            where: { id },
        });
        if (!setting) {
            throw new common_1.NotFoundException(`Setting with ID '${id}' not found.`);
        }
        return setting;
    }
    async findByKey(key, branchId) {
        const effectiveBranchId = branchId === undefined ? null : branchId;
        const setting = await this.prisma.setting.findFirst({
            where: {
                key,
                branchId: effectiveBranchId,
            },
        });
        if (!setting) {
            throw new common_1.NotFoundException(`Setting with key '${key}'${effectiveBranchId ? ` for branch '${effectiveBranchId}'` : ' (global)'} not found.`);
        }
        return setting;
    }
    async update(id, updateSettingInput) {
        const { id: inputId, ...dataToUpdate } = updateSettingInput;
        if (inputId && inputId !== id) {
            throw new common_1.ConflictException('ID in input DTO does not match ID in path.');
        }
        const existingSetting = await this.prisma.setting.findUnique({
            where: { id },
        });
        if (!existingSetting) {
            throw new common_1.NotFoundException(`Setting with ID '${id}' not found.`);
        }
        if (dataToUpdate.key !== undefined || dataToUpdate.branchId !== undefined) {
            const newKey = dataToUpdate.key === undefined ? existingSetting.key : dataToUpdate.key;
            const newBranchId = dataToUpdate.branchId === undefined
                ? existingSetting.branchId
                : dataToUpdate.branchId;
            if (newKey !== null &&
                (newKey !== existingSetting.key ||
                    newBranchId !== existingSetting.branchId)) {
                const conflictingSetting = await this.prisma.setting.findFirst({
                    where: {
                        key: newKey,
                        branchId: newBranchId,
                        NOT: {
                            id: id,
                        },
                    },
                });
                if (conflictingSetting) {
                    throw new common_1.ConflictException(`Another setting with key '${newKey}'${newBranchId ? ` for branch '${newBranchId}'` : ' (global)'} already exists.`);
                }
            }
        }
        const finalData = { ...dataToUpdate };
        if (dataToUpdate.branchId === null) {
            finalData.branchId = null;
        }
        return this.prisma.setting.update({
            where: { id },
            data: finalData,
        });
    }
    async remove(id) {
        const setting = await this.prisma.setting.findUnique({ where: { id } });
        if (!setting) {
            throw new common_1.NotFoundException(`Setting with ID '${id}' not found.`);
        }
        return this.prisma.setting.delete({
            where: { id },
        });
    }
    async updateChurchProfile(branchId, profileData) {
        try {
            this.logger.log(`Updating church profile for branch ${branchId}`);
            const settingPromises = Object.entries(profileData).map(async ([key, value]) => {
                if (value === undefined || value === null) {
                    return;
                }
                const settingKey = `churchProfile.${key}`;
                const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
                try {
                    const existingSetting = await this.findByKey(settingKey, branchId);
                    await this.update(existingSetting.id, {
                        id: existingSetting.id,
                        value: stringValue,
                    });
                    return true;
                }
                catch (error) {
                    if (error instanceof common_1.NotFoundException) {
                        await this.create({
                            key: settingKey,
                            value: stringValue,
                            branchId,
                        });
                        return true;
                    }
                    throw error;
                }
            });
            await Promise.all(settingPromises);
            if (profileData.name) {
                await this.prisma.branch.update({
                    where: { id: branchId },
                    data: { name: profileData.name },
                });
            }
            return true;
        }
        catch (error) {
            this.logger.error(`Error updating church profile for branch ${branchId}: ${error instanceof Error ? error.message : 'Unknown error'}`, error instanceof Error ? error.stack : undefined);
            throw error;
        }
    }
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = SettingsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SettingsService);
//# sourceMappingURL=settings.service.js.map