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
exports.FormsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
const string_utils_1 = require("../../common/utils/string.utils");
let FormsService = class FormsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createFormInput) {
        if (!createFormInput.slug) {
            createFormInput.slug = (0, string_utils_1.slugify)(createFormInput.title);
        }
        try {
            if (createFormInput.branchId) {
                return await this.prisma.form.create({
                    data: {
                        ...createFormInput,
                        notifyEmails: createFormInput.notifyEmails || [],
                    },
                });
            }
            else {
                const { ...formData } = createFormInput;
                return await this.prisma.form.create({
                    data: {
                        ...formData,
                        notifyEmails: createFormInput.notifyEmails || [],
                    },
                });
            }
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2002') {
                    throw new Error(`A form with slug "${createFormInput.slug}" already exists.`);
                }
            }
            throw error;
        }
    }
    async findAll(filter) {
        const where = {};
        if (filter) {
            if (filter.search) {
                where.OR = [
                    { title: { contains: filter.search, mode: 'insensitive' } },
                    { description: { contains: filter.search, mode: 'insensitive' } },
                ];
            }
            if (filter.status) {
                where.status = filter.status;
            }
            if (filter.branchId) {
                where.branchId = filter.branchId;
            }
        }
        return this.prisma.form.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        const form = await this.prisma.form.findUnique({
            where: { id },
        });
        if (!form) {
            throw new common_1.NotFoundException(`Form with ID ${id} not found`);
        }
        return form;
    }
    async findBySlug(slug) {
        const form = await this.prisma.form.findUnique({
            where: { slug },
        });
        if (!form) {
            throw new common_1.NotFoundException(`Form with slug ${slug} not found`);
        }
        return form;
    }
    async update(id, updateFormInput) {
        try {
            await this.findOne(id);
            const { id: _, branchId, status, ...restData } = updateFormInput;
            const data = {
                ...restData,
                ...(status !== undefined && {
                    status: status,
                }),
                ...(branchId !== undefined && {
                    branch: { connect: { id: branchId } },
                }),
            };
            return await this.prisma.form.update({
                where: { id },
                data,
            });
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2002') {
                    throw new Error(`A form with slug "${updateFormInput.slug}" already exists.`);
                }
            }
            throw error;
        }
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.form.delete({
            where: { id },
        });
    }
    async getFormFields(formId) {
        return this.prisma.formField.findMany({
            where: { formId },
            orderBy: { order: 'asc' },
        });
    }
    async getFormSubmissions(formId) {
        return this.prisma.formSubmission.findMany({
            where: { formId },
            orderBy: { submittedAt: 'desc' },
        });
    }
    async incrementSubmissionCount(formId) {
        await this.prisma.form.update({
            where: { id: formId },
            data: { submissionCount: { increment: 1 } },
        });
    }
    async publishForm(id) {
        return this.prisma.form.update({
            where: { id },
            data: { status: 'PUBLISHED' },
        });
    }
    async archiveForm(id) {
        return this.prisma.form.update({
            where: { id },
            data: { status: 'ARCHIVED' },
        });
    }
};
exports.FormsService = FormsService;
exports.FormsService = FormsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FormsService);
//# sourceMappingURL=forms.service.js.map