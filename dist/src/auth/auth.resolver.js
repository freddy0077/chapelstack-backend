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
exports.AuthResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const signup_dto_1 = require("./dto/signup.dto");
const signin_dto_1 = require("./dto/signin.dto");
const auth_types_1 = require("./dto/auth.types");
const refresh_token_input_1 = require("./dto/refresh-token.input");
const success_message_dto_1 = require("./dto/success-message.dto");
const token_payload_dto_1 = require("./dto/token-payload.dto");
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
const current_user_decorator_1 = require("./decorators/current-user.decorator");
const common_2 = require("@nestjs/common");
let AuthResolver = class AuthResolver {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    async getCurrentUser(user) {
        const userData = await this.authService.validateUserById(user.id);
        if (!userData) {
            throw new Error('User not found');
        }
        return userData;
    }
    async register(signUpDto) {
        const user = await this.authService.signUp(signUpDto);
        return user;
    }
    async login(signInDto) {
        const authData = await this.authService.signIn(signInDto);
        return {
            accessToken: authData.accessToken,
            refreshToken: authData.refreshToken,
            user: authData.user,
        };
    }
    async logout(refreshTokenInput, res) {
        res.clearCookie('jid', { path: '/', httpOnly: true, sameSite: 'lax' });
        return this.authService.logout(refreshTokenInput);
    }
    async refreshToken(refreshTokenInput) {
        return this.authService.refreshToken(refreshTokenInput);
    }
};
exports.AuthResolver = AuthResolver;
__decorate([
    (0, graphql_1.Query)(() => auth_types_1.UserType, { name: 'me' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_types_1.UserType]),
    __metadata("design:returntype", Promise)
], AuthResolver.prototype, "getCurrentUser", null);
__decorate([
    (0, graphql_1.Mutation)(() => auth_types_1.UserType, { name: 'register' }),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [signup_dto_1.SignUpDto]),
    __metadata("design:returntype", Promise)
], AuthResolver.prototype, "register", null);
__decorate([
    (0, graphql_1.Mutation)(() => auth_types_1.AuthPayload, { name: 'login' }),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [signin_dto_1.SignInDto]),
    __metadata("design:returntype", Promise)
], AuthResolver.prototype, "login", null);
__decorate([
    (0, graphql_1.Mutation)(() => success_message_dto_1.SuccessMessageDto, { name: 'logout' }),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, common_2.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [refresh_token_input_1.RefreshTokenInput, Object]),
    __metadata("design:returntype", Promise)
], AuthResolver.prototype, "logout", null);
__decorate([
    (0, graphql_1.Mutation)(() => token_payload_dto_1.TokenPayloadDto, { name: 'refreshToken' }),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [refresh_token_input_1.RefreshTokenInput]),
    __metadata("design:returntype", Promise)
], AuthResolver.prototype, "refreshToken", null);
exports.AuthResolver = AuthResolver = __decorate([
    (0, graphql_1.Resolver)(),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthResolver);
//# sourceMappingURL=auth.resolver.js.map