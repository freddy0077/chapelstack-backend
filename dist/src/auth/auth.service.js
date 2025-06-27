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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const bcrypt = __importStar(require("bcrypt"));
const crypto = __importStar(require("crypto"));
let AuthService = class AuthService {
    prisma;
    jwtService;
    configService;
    constructor(prisma, jwtService, configService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
    }
    _generateAccessToken(user) {
        const payload = { email: user.email, sub: user.id };
        return this.jwtService.sign(payload);
    }
    _generateRawRefreshToken() {
        return crypto.randomBytes(32).toString('hex');
    }
    _hashToken(token) {
        return crypto.createHash('sha256').update(token).digest('hex');
    }
    async _createAndStoreRefreshToken(userId) {
        const rawRefreshToken = this._generateRawRefreshToken();
        const hashedRefreshToken = this._hashToken(rawRefreshToken);
        const refreshTokenExpiresInDays = parseInt(this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_DAYS', '7'));
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + refreshTokenExpiresInDays);
        await this.prisma.refreshToken.create({
            data: {
                userId,
                hashedToken: hashedRefreshToken,
                expiresAt,
            },
        });
        return rawRefreshToken;
    }
    async signUp(signUpDto) {
        const { email, password: passwordInput, firstName, lastName, phoneNumber, } = signUpDto;
        const existingUser = await this.prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('User with this email already exists.');
        }
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(passwordInput, saltRounds);
        const user = await this.prisma.user.create({
            data: {
                email,
                passwordHash,
                firstName,
                lastName,
                phoneNumber,
            },
        });
        const { passwordHash: _, ...userData } = user;
        return {
            id: userData.id,
            email: userData.email,
            firstName: userData.firstName ?? undefined,
            lastName: userData.lastName ?? undefined,
            phoneNumber: userData.phoneNumber ?? undefined,
            isActive: userData.isActive,
            isEmailVerified: userData.isEmailVerified,
            lastLoginAt: userData.lastLoginAt ?? undefined,
            createdAt: userData.createdAt,
            updatedAt: userData.updatedAt,
        };
    }
    async signIn(signInDto) {
        const { email, password: passwordInput } = signInDto;
        const user = await this.prisma.user.findUnique({
            where: { email },
            include: {
                roles: true,
                userBranches: {
                    include: {
                        branch: true,
                        role: true,
                    },
                },
                member: true,
            },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials.');
        }
        const isPasswordMatching = await bcrypt.compare(passwordInput, user.passwordHash);
        if (!isPasswordMatching) {
            throw new common_1.UnauthorizedException('Invalid credentials.');
        }
        if (!user.isActive) {
            throw new common_1.UnauthorizedException('User account is inactive.');
        }
        const accessToken = this._generateAccessToken(user);
        const refreshToken = await this._createAndStoreRefreshToken(user.id);
        await this.prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });
        const { passwordHash, ...userData } = user;
        return {
            accessToken,
            refreshToken,
            user: {
                id: userData.id,
                email: userData.email,
                firstName: userData.firstName ?? undefined,
                lastName: userData.lastName ?? undefined,
                phoneNumber: userData.phoneNumber ?? undefined,
                isActive: userData.isActive,
                isEmailVerified: userData.isEmailVerified,
                lastLoginAt: user.lastLoginAt ?? undefined,
                createdAt: userData.createdAt,
                updatedAt: userData.updatedAt,
                organisationId: userData.organisationId ?? undefined,
                roles: userData.roles,
                userBranches: Array.isArray(userData.userBranches)
                    ? userData.userBranches.map((ub) => ({
                        ...ub,
                        branchId: ub.branchId ?? undefined,
                        branch: ub.branch ?? undefined,
                    }))
                    : [],
                member: userData.member
                    ? {
                        id: userData.member.id,
                        firstName: userData.member.firstName,
                        lastName: userData.member.lastName,
                        profileImageUrl: userData.member.profileImageUrl ?? undefined,
                        status: userData.member.status ?? undefined,
                    }
                    : undefined,
            },
        };
    }
    async refreshToken(refreshTokenInput) {
        const { refreshToken: rawRefreshTokenFromInput } = refreshTokenInput;
        const hashedTokenFromInput = this._hashToken(rawRefreshTokenFromInput);
        const refreshTokenTable = this.prisma.refreshToken;
        const storedToken = await refreshTokenTable.findUnique({
            where: { hashedToken: hashedTokenFromInput },
            include: { user: true },
        });
        if (!storedToken) {
            throw new common_1.UnauthorizedException('Invalid credentials.');
        }
        if (storedToken.isRevoked) {
            await refreshTokenTable.updateMany({
                where: { userId: storedToken.userId },
                data: { isRevoked: true },
            });
            throw new common_1.UnauthorizedException('Invalid credentials.');
        }
        if (new Date() > storedToken.expiresAt) {
            throw new common_1.UnauthorizedException('Invalid credentials.');
        }
        if (!storedToken.user || !storedToken.user.isActive) {
            throw new common_1.UnauthorizedException('Invalid credentials.');
        }
        await this.prisma.refreshToken.update({
            where: { id: storedToken.id },
            data: { isRevoked: true },
        });
        const newAccessToken = this._generateAccessToken(storedToken.user);
        const newRawRefreshToken = await this._createAndStoreRefreshToken(storedToken.userId);
        return {
            accessToken: newAccessToken,
            refreshToken: newRawRefreshToken,
        };
    }
    async validateUserById(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                roles: true,
                userBranches: {
                    include: {
                        branch: true,
                        role: true,
                    },
                },
            },
        });
        if (user && user.isActive) {
            const { passwordHash, ...userData } = user;
            return {
                id: userData.id,
                email: userData.email,
                firstName: userData.firstName ?? undefined,
                lastName: userData.lastName ?? undefined,
                phoneNumber: userData.phoneNumber ?? undefined,
                isActive: userData.isActive,
                isEmailVerified: userData.isEmailVerified,
                lastLoginAt: userData.lastLoginAt ?? undefined,
                createdAt: userData.createdAt,
                updatedAt: userData.updatedAt,
                roles: userData.roles,
                userBranches: Array.isArray(userData.userBranches)
                    ? userData.userBranches.map((ub) => ({
                        ...ub,
                        branchId: ub.branchId ?? undefined,
                        branch: ub.branch ?? undefined,
                    }))
                    : [],
            };
        }
        return null;
    }
    async logout(refreshTokenInput) {
        const { refreshToken: rawRefreshTokenFromInput } = refreshTokenInput;
        if (!rawRefreshTokenFromInput) {
            return { message: 'Logout successful as no token was provided.' };
        }
        const hashedTokenFromInput = this._hashToken(rawRefreshTokenFromInput);
        const storedToken = await this.prisma.refreshToken.findUnique({
            where: { hashedToken: hashedTokenFromInput },
        });
        if (!storedToken) {
            return { message: 'Logout successful or token not found.' };
        }
        if (storedToken.isRevoked) {
            return { message: 'Logout successful, token already revoked.' };
        }
        await this.prisma.refreshToken.update({
            where: { id: storedToken.id },
            data: { isRevoked: true },
        });
        return { message: 'Successfully logged out.' };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map