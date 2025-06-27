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
exports.FormSubmissionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
const forms_service_1 = require("./forms.service");
let FormSubmissionsService = class FormSubmissionsService {
    prisma;
    formsService;
    constructor(prisma, formsService) {
        this.prisma = prisma;
        this.formsService = formsService;
    }
    async create(createSubmissionInput) {
        const form = await this.prisma.form.findUnique({
            where: { id: createSubmissionInput.formId },
        });
        if (!form) {
            throw new common_1.NotFoundException(`Form with ID ${createSubmissionInput.formId} not found`);
        }
        if (form.status !== 'PUBLISHED') {
            throw new Error('Cannot submit to a form that is not published');
        }
        if (form.expiresAt && new Date(form.expiresAt) < new Date()) {
            throw new Error('This form has expired and is no longer accepting submissions');
        }
        const { fieldValues, ...submissionData } = createSubmissionInput;
        try {
            const result = await this.prisma.$transaction(async (prisma) => {
                const submission = await prisma.formSubmission.create({
                    data: {
                        ...submissionData,
                        status: 'COMPLETED',
                    },
                });
                if (fieldValues && fieldValues.length > 0) {
                    await prisma.formFieldValue.createMany({
                        data: fieldValues.map((fieldValue) => ({
                            submissionId: submission.id,
                            fieldId: fieldValue.fieldId,
                            value: fieldValue.value,
                            fileUrl: fieldValue.fileUrl,
                        })),
                    });
                }
                return submission;
            });
            await this.formsService.incrementSubmissionCount(createSubmissionInput.formId);
            return result;
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2003') {
                    throw new Error('One or more field IDs are invalid');
                }
            }
            throw error;
        }
    }
    async findAll(filter) {
        const where = {
            formId: filter.formId,
        };
        if (filter.branchId) {
            where.branchId = filter.branchId;
        }
        if (filter.status) {
            where.status = filter.status;
        }
        if (filter.startDate || filter.endDate) {
            where.submittedAt = {};
            if (filter.startDate) {
                where.submittedAt.gte = filter.startDate;
            }
            if (filter.endDate) {
                where.submittedAt.lte = filter.endDate;
            }
        }
        return this.prisma.formSubmission.findMany({
            where,
            orderBy: { submittedAt: 'desc' },
        });
    }
    async findOne(id) {
        const submission = await this.prisma.formSubmission.findUnique({
            where: { id },
        });
        if (!submission) {
            throw new common_1.NotFoundException(`Form submission with ID ${id} not found`);
        }
        return submission;
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.formSubmission.delete({
            where: { id },
        });
    }
    async getFieldValues(submissionId) {
        return this.prisma.formFieldValue.findMany({
            where: { submissionId },
            include: { field: true },
        });
    }
    async exportSubmissions(formId) {
        const form = await this.prisma.form.findUnique({
            where: { id: formId },
            include: {
                fields: {
                    orderBy: { order: 'asc' },
                },
            },
        });
        if (!form) {
            throw new common_1.NotFoundException(`Form with ID ${formId} not found`);
        }
        const submissions = await this.prisma.formSubmission.findMany({
            where: { formId },
            orderBy: { submittedAt: 'desc' },
            include: {
                fieldValues: {
                    include: {
                        field: true,
                    },
                },
            },
        });
        return submissions.map((submission) => {
            const result = {
                submissionId: submission.id,
                submittedAt: submission.submittedAt,
            };
            form.fields.forEach((field) => {
                const fieldValue = submission.fieldValues.find((fv) => fv.fieldId === field.id);
                result[field.label] = fieldValue?.value || '';
            });
            return result;
        });
    }
};
exports.FormSubmissionsService = FormSubmissionsService;
exports.FormSubmissionsService = FormSubmissionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        forms_service_1.FormsService])
], FormSubmissionsService);
//# sourceMappingURL=form-submissions.service.js.map