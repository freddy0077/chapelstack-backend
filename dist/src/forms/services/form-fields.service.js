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
exports.FormFieldsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let FormFieldsService = class FormFieldsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createFormFieldInput) {
        const form = await this.prisma.form.findUnique({
            where: { id: createFormFieldInput.formId },
        });
        if (!form) {
            throw new common_1.NotFoundException(`Form with ID ${createFormFieldInput.formId} not found`);
        }
        return this.prisma.formField.create({
            data: createFormFieldInput,
        });
    }
    async createMany(fields) {
        if (!fields.length)
            return [];
        const formId = fields[0].formId;
        const form = await this.prisma.form.findUnique({
            where: { id: formId },
        });
        if (!form) {
            throw new common_1.NotFoundException(`Form with ID ${formId} not found`);
        }
        const createdFields = await this.prisma.$transaction(fields.map((field) => this.prisma.formField.create({
            data: field,
        })));
        return createdFields;
    }
    async findAll(formId) {
        return this.prisma.formField.findMany({
            where: { formId },
            orderBy: { order: 'asc' },
        });
    }
    async findOne(id) {
        const field = await this.prisma.formField.findUnique({
            where: { id },
        });
        if (!field) {
            throw new common_1.NotFoundException(`Form field with ID ${id} not found`);
        }
        return field;
    }
    async update(id, updateFormFieldInput) {
        await this.findOne(id);
        return this.prisma.formField.update({
            where: { id },
            data: updateFormFieldInput,
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.formField.delete({
            where: { id },
        });
    }
    async reorderFields(formId, fieldIds) {
        const form = await this.prisma.form.findUnique({
            where: { id: formId },
        });
        if (!form) {
            throw new common_1.NotFoundException(`Form with ID ${formId} not found`);
        }
        const existingFields = await this.prisma.formField.findMany({
            where: { formId },
        });
        const existingFieldIds = existingFields.map((field) => field.id);
        const allFieldsExist = fieldIds.every((id) => existingFieldIds.includes(id));
        if (!allFieldsExist) {
            throw new Error('One or more field IDs are invalid or do not belong to this form');
        }
        const updates = fieldIds.map((fieldId, index) => this.prisma.formField.update({
            where: { id: fieldId },
            data: { order: index },
        }));
        return this.prisma.$transaction(updates);
    }
};
exports.FormFieldsService = FormFieldsService;
exports.FormFieldsService = FormFieldsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FormFieldsService);
//# sourceMappingURL=form-fields.service.js.map