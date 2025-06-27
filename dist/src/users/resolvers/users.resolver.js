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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const users_service_1 = require("../users.service");
const user_entity_1 = require("../entities/user.entity");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const graphql_2 = require("@nestjs/graphql");
const bcrypt = __importStar(require("bcrypt"));
const create_users_with_role_input_1 = require("../dto/create-users-with-role.input");
let CreatedUserResult = class CreatedUserResult {
    email;
    firstName;
    lastName;
    roleName;
    id;
    error;
};
__decorate([
    (0, graphql_2.Field)(),
    __metadata("design:type", String)
], CreatedUserResult.prototype, "email", void 0);
__decorate([
    (0, graphql_2.Field)(),
    __metadata("design:type", String)
], CreatedUserResult.prototype, "firstName", void 0);
__decorate([
    (0, graphql_2.Field)(),
    __metadata("design:type", String)
], CreatedUserResult.prototype, "lastName", void 0);
__decorate([
    (0, graphql_2.Field)(),
    __metadata("design:type", String)
], CreatedUserResult.prototype, "roleName", void 0);
__decorate([
    (0, graphql_2.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreatedUserResult.prototype, "id", void 0);
__decorate([
    (0, graphql_2.Field)({ nullable: true }),
    __metadata("design:type", String)
], CreatedUserResult.prototype, "error", void 0);
CreatedUserResult = __decorate([
    (0, graphql_2.ObjectType)()
], CreatedUserResult);
let UsersResolver = class UsersResolver {
    usersService;
    prisma;
    constructor(usersService, prisma) {
        this.usersService = usersService;
        this.prisma = prisma;
    }
    async createUsersWithRole(input) {
        const results = [];
        for (const userInput of input.users) {
            try {
                const role = await this.prisma.role.findFirst({
                    where: { name: userInput.roleName },
                });
                if (!role) {
                    throw new Error(`Role '${userInput.roleName}' not found.`);
                }
                const saltRounds = 10;
                const passwordHash = await bcrypt.hash(userInput.password, saltRounds);
                const user = await this.prisma.user.create({
                    data: {
                        email: userInput.email,
                        passwordHash,
                        firstName: userInput.firstName,
                        lastName: userInput.lastName,
                        roles: { connect: { id: role.id } },
                        organisation: { connect: { id: input.organisationId } },
                        userBranches: userInput.branchId
                            ? {
                                create: {
                                    branch: { connect: { id: userInput.branchId } },
                                    role: { connect: { id: role.id } },
                                },
                            }
                            : undefined,
                        member: {
                            create: {
                                firstName: userInput.firstName,
                                lastName: userInput.lastName,
                                email: userInput.email,
                                organisation: { connect: { id: input.organisationId } },
                                branch: userInput.branchId
                                    ? { connect: { id: userInput.branchId } }
                                    : undefined,
                                gender: 'UNKNOWN',
                            },
                        },
                    },
                });
                results.push({
                    id: user.id,
                    email: userInput.email,
                    firstName: userInput.firstName,
                    lastName: userInput.lastName,
                    roleName: userInput.roleName,
                });
            }
            catch (e) {
                if (e instanceof Error) {
                    results.push({
                        email: userInput.email,
                        firstName: userInput.firstName,
                        lastName: userInput.lastName,
                        roleName: userInput.roleName,
                        error: e.message,
                    });
                }
                else {
                    results.push({
                        email: userInput.email,
                        firstName: userInput.firstName,
                        lastName: userInput.lastName,
                        roleName: userInput.roleName,
                        error: String(e),
                    });
                }
            }
        }
        return results;
    }
};
exports.UsersResolver = UsersResolver;
__decorate([
    (0, graphql_1.Mutation)(() => [CreatedUserResult]),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_users_with_role_input_1.CreateUsersWithRoleInput]),
    __metadata("design:returntype", Promise)
], UsersResolver.prototype, "createUsersWithRole", null);
exports.UsersResolver = UsersResolver = __decorate([
    (0, graphql_1.Resolver)(() => user_entity_1.User),
    __param(1, (0, common_1.Inject)(prisma_service_1.PrismaService)),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        prisma_service_1.PrismaService])
], UsersResolver);
//# sourceMappingURL=users.resolver.js.map