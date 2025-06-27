"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemAdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const config_1 = require("@nestjs/config");
const os = __importStar(require("os"));
const process = __importStar(require("process"));
let SystemAdminService = class SystemAdminService {
    prisma;
    configService;
    constructor(prisma, configService) {
        this.prisma = prisma;
        this.configService = configService;
    }
    async getSystemHealth() {
        let dbStatus = 'healthy';
        let dbLatency = 0;
        try {
            const startTime = Date.now();
            await this.prisma.$queryRaw `SELECT 1`;
            dbLatency = Date.now() - startTime;
        }
        catch (_error) {
            dbStatus = 'unhealthy';
        }
        const memoryUsage = process.memoryUsage();
        const cpuUsage = process.cpuUsage();
        const systemUptime = os.uptime();
        const processUptime = process.uptime();
        const totalMemory = os.totalmem();
        const freeMemory = os.freemem();
        return {
            timestamp: new Date(),
            database: {
                status: dbStatus,
                latency: dbLatency,
            },
            system: {
                totalMemory,
                freeMemory,
                memoryUsage: {
                    rss: memoryUsage.rss,
                    heapTotal: memoryUsage.heapTotal,
                    heapUsed: memoryUsage.heapUsed,
                    external: memoryUsage.external,
                },
                cpuUsage: {
                    user: cpuUsage.user,
                    system: cpuUsage.system,
                },
                systemUptime,
                processUptime,
                platform: process.platform,
                nodeVersion: process.version,
            },
        };
    }
    async createAnnouncement(title, content, startDate, endDate, targetRoleIds, targetBranchIds) {
        if (targetRoleIds && targetRoleIds.length > 0) {
            const roles = await this.prisma.role.findMany({
                where: {
                    id: {
                        in: targetRoleIds,
                    },
                },
            });
            if (roles.length !== targetRoleIds.length) {
                throw new common_1.NotFoundException('One or more target roles not found');
            }
        }
        if (targetBranchIds && targetBranchIds.length > 0) {
            const branches = await this.prisma.branch.findMany({
                where: {
                    id: {
                        in: targetBranchIds,
                    },
                },
            });
            if (branches.length !== targetBranchIds.length) {
                throw new common_1.NotFoundException('One or more target branches not found');
            }
        }
        const announcementData = {
            title,
            content,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            targetRoleIds: targetRoleIds || [],
            targetBranchIds: targetBranchIds || [],
            isActive: true,
        };
        return this.prisma.setting.create({
            data: {
                key: `announcement.${Date.now()}`,
                value: JSON.stringify(announcementData),
            },
        });
    }
    async getActiveAnnouncements(userId, branchId) {
        const now = new Date();
        const announcementSettings = await this.prisma.setting.findMany({
            where: {
                key: {
                    startsWith: 'announcement.',
                },
            },
        });
        const announcements = announcementSettings
            .map((setting) => {
            try {
                return {
                    id: setting.id,
                    key: setting.key,
                    ...JSON.parse(setting.value),
                };
            }
            catch (_error) {
                return null;
            }
        })
            .filter((announcement) => announcement !== null)
            .filter((announcement) => {
            const startDate = new Date(announcement.startDate);
            const endDate = new Date(announcement.endDate);
            const isActive = announcement.isActive && startDate <= now && endDate >= now;
            if (!isActive)
                return false;
            if (!userId && !branchId)
                return true;
            if ((!announcement.targetRoleIds ||
                announcement.targetRoleIds.length === 0) &&
                (!announcement.targetBranchIds ||
                    announcement.targetBranchIds.length === 0)) {
                return true;
            }
            let userMatch = false;
            if (userId &&
                announcement.targetRoleIds &&
                announcement.targetRoleIds.length > 0) {
                userMatch = true;
            }
            let branchMatch = false;
            if (branchId &&
                announcement.targetBranchIds &&
                announcement.targetBranchIds.length > 0 &&
                announcement.targetBranchIds.includes(branchId)) {
                branchMatch = true;
            }
            return userMatch || branchMatch;
        });
        return announcements;
    }
    async updateAnnouncement(id, title, content, startDate, endDate, targetRoleIds, targetBranchIds, isActive) {
        const setting = await this.prisma.setting.findUnique({
            where: { id },
        });
        if (!setting || !setting.key.startsWith('announcement.')) {
            throw new common_1.NotFoundException('Announcement not found');
        }
        try {
            const announcement = JSON.parse(setting.value);
            const updatedAnnouncement = {
                ...announcement,
                title: title !== undefined ? title : announcement.title,
                content: content !== undefined ? content : announcement.content,
                startDate: startDate !== undefined
                    ? startDate.toISOString()
                    : announcement.startDate,
                endDate: endDate !== undefined ? endDate.toISOString() : announcement.endDate,
                targetRoleIds: targetRoleIds !== undefined
                    ? targetRoleIds
                    : announcement.targetRoleIds,
                targetBranchIds: targetBranchIds !== undefined
                    ? targetBranchIds
                    : announcement.targetBranchIds,
                isActive: isActive !== undefined ? isActive : announcement.isActive,
            };
            const updatedSetting = await this.prisma.setting.update({
                where: { id },
                data: {
                    value: JSON.stringify(updatedAnnouncement),
                },
            });
            return {
                id: updatedSetting.id,
                key: updatedSetting.key,
                ...updatedAnnouncement,
            };
        }
        catch (e) {
            throw new Error('Failed to parse announcement data');
        }
    }
    async deleteAnnouncement(id) {
        const setting = await this.prisma.setting.findUnique({
            where: { id },
        });
        if (!setting || !setting.key.startsWith('announcement.')) {
            throw new common_1.NotFoundException('Announcement not found');
        }
        await this.prisma.setting.delete({
            where: { id },
        });
        return { id, deleted: true };
    }
};
exports.SystemAdminService = SystemAdminService;
exports.SystemAdminService = SystemAdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], SystemAdminService);
//# sourceMappingURL=system-admin.service.js.map