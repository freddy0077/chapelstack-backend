"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const mainSchemaPath = path_1.default.join(__dirname, '../prisma/schema.prisma');
const childrenSchemaPath = path_1.default.join(__dirname, '../prisma/children-schema.prisma');
let mainSchema = fs_1.default.readFileSync(mainSchemaPath, 'utf8');
const childrenSchema = fs_1.default.readFileSync(childrenSchemaPath, 'utf8');
const modelRegex = /model\s+\w+\s+{[\s\S]*?}/g;
const childrenModels = childrenSchema.match(modelRegex) || [];
mainSchema += "\n\n// Children's Ministry Models\n";
mainSchema += childrenModels.join('\n\n');
fs_1.default.writeFileSync(mainSchemaPath, mainSchema);
console.log('Prisma schemas merged successfully.');
//# sourceMappingURL=merge-prisma-schemas.js.map