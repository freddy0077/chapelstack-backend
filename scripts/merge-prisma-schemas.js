import fs from 'fs';
import path from 'path';

// Read the main schema
const mainSchemaPath = path.join(__dirname, '../prisma/schema.prisma');
const childrenSchemaPath = path.join(
  __dirname,
  '../prisma/children-schema.prisma',
);

let mainSchema = fs.readFileSync(mainSchemaPath, 'utf8');
const childrenSchema = fs.readFileSync(childrenSchemaPath, 'utf8');

// Extract the model definitions from children schema (excluding any generator or datasource blocks)
const modelRegex = /model\s+\w+\s+{[\s\S]*?}/g;
const childrenModels = childrenSchema.match(modelRegex) || [];

// Append the children models to the main schema
mainSchema += "\n\n// Children's Ministry Models\n";
mainSchema += childrenModels.join('\n\n');

// Write the merged schema back to the main schema file
fs.writeFileSync(mainSchemaPath, mainSchema);

console.log('Prisma schemas merged successfully.');
