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
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Start seeding ...');
    const saltRounds = 10;
    const organisation = await prisma.organisation.upsert({
        where: { email: 'hello@chapelstack.com' },
        update: {},
        create: {
            name: 'Chapel Stack',
            description: 'Default organization for Chapel Stack',
            email: 'hello@chapelstack.com',
            primaryColor: '#000000',
            secondaryColor: '#FFFFFF',
        },
    });
    const branch = await prisma.branch.upsert({
        where: { email: 'main@chapelstack.com' },
        update: {},
        create: {
            name: 'Main Branch',
            organisationId: organisation.id,
            email: 'main@chapelstack.com',
            city: 'Accra',
            country: 'Ghana',
        },
    });
    const roles = [
        { name: 'SUPER_ADMIN', description: 'Super Admin Role' },
        { name: 'BRANCH_ADMIN', description: 'Branch Admin Role' },
        { name: 'MEMBER', description: 'Member Role' },
        { name: 'GUEST', description: 'Guest Role' },
    ];
    for (const roleData of roles) {
        const role = await prisma.role.upsert({
            where: { name: roleData.name },
            update: {},
            create: roleData,
        });
        const email = `${role.name.toLowerCase().replace('_', '')}@chapelstack.com`;
        const password = 'password';
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const user = await prisma.user.upsert({
            where: { email },
            update: {},
            create: {
                email,
                passwordHash: hashedPassword,
                firstName: role.name.split('_')[0],
                lastName: 'User',
                organisationId: organisation.id,
                roles: {
                    connect: { id: role.id },
                },
            },
        });
        await prisma.member.upsert({
            where: { userId: user.id },
            update: {},
            create: {
                firstName: user.firstName || role.name.split('_')[0],
                lastName: user.lastName || 'User',
                email: user.email,
                userId: user.id,
                branchId: branch.id,
                organisationId: organisation.id,
                status: 'ACTIVE',
                gender: 'NOT_SPECIFIED',
            },
        });
        console.log(`Created ${role.name} user with email: ${email}`);
    }
    console.log('Seeding finished.');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map