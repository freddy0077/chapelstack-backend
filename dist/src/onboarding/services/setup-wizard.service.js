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
var SetupWizardService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetupWizardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const branches_service_1 = require("../../branches/branches.service");
const users_service_1 = require("../../users/users.service");
const settings_service_1 = require("../../settings/settings.service");
const onboarding_service_1 = require("./onboarding.service");
const members_service_1 = require("../../members/services/members.service");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const uuid_1 = require("uuid");
const util_1 = require("util");
let SetupWizardService = SetupWizardService_1 = class SetupWizardService {
    prisma;
    branchesService;
    usersService;
    settingsService;
    onboardingService;
    membersService;
    logger = new common_1.Logger(SetupWizardService_1.name);
    uploadDir = path.join(process.cwd(), 'uploads');
    constructor(prisma, branchesService, usersService, settingsService, onboardingService, membersService) {
        this.prisma = prisma;
        this.branchesService = branchesService;
        this.usersService = usersService;
        this.settingsService = settingsService;
        this.onboardingService = onboardingService;
        this.membersService = membersService;
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
        }
    }
    async initiateBranchSetup(input) {
        try {
            const branch = await this.branchesService.create({
                name: input.name,
                address: input.address,
                city: input.city,
                country: input.country,
                email: input.email,
                phoneNumber: input.phoneNumber,
                organisationId: input.organisationId,
            });
            await this.onboardingService.initializeOnboarding(branch.id);
            if (input.timezone) {
                await this.settingsService.create({
                    key: 'timezone',
                    value: input.timezone,
                    branchId: branch.id,
                });
            }
            if (input.currency) {
                await this.settingsService.create({
                    key: 'currency',
                    value: input.currency,
                    branchId: branch.id,
                });
            }
            return branch;
        }
        catch (error) {
            this.logger.error(`Error in branch setup: ${error.message}`, error.stack);
            throw error;
        }
    }
    async configureInitialSettings(branchId, input) {
        try {
            await this.settingsService.create({
                key: 'organizationName',
                value: input.organizationName,
                branchId,
            });
            if (input.organizationDescription) {
                await this.settingsService.create({
                    key: 'organizationDescription',
                    value: input.organizationDescription,
                    branchId,
                });
            }
            if (input.primaryColor) {
                await this.settingsService.create({
                    key: 'primaryColor',
                    value: input.primaryColor,
                    branchId,
                });
            }
            if (input.secondaryColor) {
                await this.settingsService.create({
                    key: 'secondaryColor',
                    value: input.secondaryColor,
                    branchId,
                });
            }
            if (input.websiteUrl) {
                await this.settingsService.create({
                    key: 'websiteUrl',
                    value: input.websiteUrl,
                    branchId,
                });
            }
            if (input.logo) {
                const logoUrl = await this.processLogoUpload(branchId, await input.logo);
                await this.settingsService.create({
                    key: 'logoUrl',
                    value: logoUrl,
                    branchId,
                });
            }
            return true;
        }
        catch (error) {
            this.logger.error(`Error configuring initial settings: ${error.message}`, error.stack);
            throw error;
        }
    }
    async processLogoUpload(branchId, file) {
        try {
            const { createReadStream, filename } = file;
            const uniqueFilename = `${branchId}_${(0, uuid_1.v4)()}${path.extname(filename)}`;
            const filePath = path.join(this.uploadDir, uniqueFilename);
            await (0, util_1.promisify)((await import('stream')).pipeline)(createReadStream(), fs.createWriteStream(filePath));
            return `/uploads/${uniqueFilename}`;
        }
        catch (error) {
            this.logger.error(`Error uploading logo: ${error.message}`, error.stack);
            throw error;
        }
    }
    async createSuperAdminUser(email, password, firstName, lastName, organisationId, branchId) {
        try {
            const user = await this.usersService.create({
                email,
                password,
                firstName,
                lastName,
                organisationId,
            });
            await this.membersService.createMember({
                firstName,
                lastName,
                email,
                branchId,
                organisationId,
                userId: user.id,
            });
            await this.prisma.user.update({
                where: { id: user.id },
                data: {
                    roles: {
                        connect: { id: await this.getSuperAdminRoleId() },
                    },
                },
            });
            await this.prisma.userBranch.create({
                data: {
                    userId: user.id,
                    branchId,
                    roleId: await this.getSuperAdminRoleId(),
                },
            });
            return user;
        }
        catch (error) {
            this.logger.error(`Error creating super admin user: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getSuperAdminRoleId() {
        try {
            const superAdminRole = await this.prisma.role.findFirst({
                where: {
                    name: 'SUPER_ADMIN',
                },
            });
            if (!superAdminRole) {
                const newRole = await this.prisma.role.create({
                    data: {
                        name: 'SUPER_ADMIN',
                        description: 'Full system access',
                    },
                });
                return newRole.id;
            }
            return superAdminRole.id;
        }
        catch (error) {
            this.logger.error(`Error getting super admin role: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.SetupWizardService = SetupWizardService;
exports.SetupWizardService = SetupWizardService = SetupWizardService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        branches_service_1.BranchesService,
        users_service_1.UsersService,
        settings_service_1.SettingsService,
        onboarding_service_1.OnboardingService,
        members_service_1.MembersService])
], SetupWizardService);
//# sourceMappingURL=setup-wizard.service.js.map