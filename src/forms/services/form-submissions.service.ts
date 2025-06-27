import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFormSubmissionInput } from '../dto/create-form-submission.input';
import { SubmissionFilterInput } from '../dto/submission-filter.input';
import { FormSubmission as PrismaFormSubmission, Prisma } from '@prisma/client';
import { FormsService } from './forms.service';

@Injectable()
export class FormSubmissionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly formsService: FormsService,
  ) {}

  async create(
    createSubmissionInput: CreateFormSubmissionInput,
  ): Promise<PrismaFormSubmission> {
    // Verify that the form exists and is published
    const form = await this.prisma.form.findUnique({
      where: { id: createSubmissionInput.formId },
    });

    if (!form) {
      throw new NotFoundException(
        `Form with ID ${createSubmissionInput.formId} not found`,
      );
    }

    if (form.status !== 'PUBLISHED') {
      throw new Error('Cannot submit to a form that is not published');
    }

    // Check if form has expired
    if (form.expiresAt && new Date(form.expiresAt) < new Date()) {
      throw new Error(
        'This form has expired and is no longer accepting submissions',
      );
    }

    // Create the submission with field values in a transaction
    const { fieldValues, ...submissionData } = createSubmissionInput;

    try {
      const result = await this.prisma.$transaction(async (prisma) => {
        // Create the submission
        const submission = await prisma.formSubmission.create({
          data: {
            ...submissionData,
            status: 'COMPLETED',
          },
        });

        // Create field values
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

      // Increment the submission count on the form
      await this.formsService.incrementSubmissionCount(
        createSubmissionInput.formId,
      );

      return result;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new Error('One or more field IDs are invalid');
        }
      }
      throw error;
    }
  }

  async findAll(
    filter: SubmissionFilterInput,
  ): Promise<PrismaFormSubmission[]> {
    const where: Prisma.FormSubmissionWhereInput = {
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

  async findOne(id: string): Promise<PrismaFormSubmission> {
    const submission = await this.prisma.formSubmission.findUnique({
      where: { id },
    });

    if (!submission) {
      throw new NotFoundException(`Form submission with ID ${id} not found`);
    }

    return submission;
  }

  async remove(id: string): Promise<PrismaFormSubmission> {
    // Check if submission exists
    await this.findOne(id);

    // Delete the submission (field values will be cascade deleted)
    return this.prisma.formSubmission.delete({
      where: { id },
    });
  }

  async getFieldValues(submissionId: string) {
    return this.prisma.formFieldValue.findMany({
      where: { submissionId },
      include: { field: true },
    });
  }

  async exportSubmissions(formId: string): Promise<any[]> {
    // Get the form with its fields
    const form = await this.prisma.form.findUnique({
      where: { id: formId },
      include: {
        fields: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!form) {
      throw new NotFoundException(`Form with ID ${formId} not found`);
    }

    // Get all submissions with their field values
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

    // Transform the data for export
    return submissions.map((submission) => {
      const result: any = {
        submissionId: submission.id,
        submittedAt: submission.submittedAt,
      };

      // Add field values
      form.fields.forEach((field) => {
        const fieldValue = submission.fieldValues.find(
          (fv) => fv.fieldId === field.id,
        );
        result[field.label] = fieldValue?.value || '';
      });

      return result;
    });
  }
}
