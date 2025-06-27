import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFormInput } from '../dto/create-form.input';
import { UpdateFormInput } from '../dto/update-form.input';
import { FormFilterInput } from '../dto/form-filter.input';
import { Form as PrismaForm, Prisma, FormStatus } from '@prisma/client';
import { slugify } from '../../common/utils/string.utils';

@Injectable()
export class FormsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createFormInput: CreateFormInput): Promise<PrismaForm> {
    // Generate slug if not provided
    if (!createFormInput.slug) {
      createFormInput.slug = slugify(createFormInput.title);
    }

    try {
      // If branchId is provided, use FormUncheckedCreateInput
      if (createFormInput.branchId) {
        return await this.prisma.form.create({
          data: {
            ...createFormInput,
            notifyEmails: createFormInput.notifyEmails || [],
          } as Prisma.FormUncheckedCreateInput,
        });
      } else {
        // Otherwise use FormCreateInput without branchId
        const { ...formData } = createFormInput;
        return await this.prisma.form.create({
          data: {
            ...formData,
            notifyEmails: createFormInput.notifyEmails || [],
          } as Prisma.FormCreateInput,
        });
      }
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new Error(
            `A form with slug "${createFormInput.slug}" already exists.`,
          );
        }
      }
      throw error;
    }
  }

  async findAll(filter?: FormFilterInput): Promise<PrismaForm[]> {
    const where: Prisma.FormWhereInput = {};

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

  async findOne(id: string): Promise<PrismaForm> {
    const form = await this.prisma.form.findUnique({
      where: { id },
    });

    if (!form) {
      throw new NotFoundException(`Form with ID ${id} not found`);
    }

    return form;
  }

  async findBySlug(slug: string): Promise<PrismaForm> {
    const form = await this.prisma.form.findUnique({
      where: { slug },
    });

    if (!form) {
      throw new NotFoundException(`Form with slug ${slug} not found`);
    }

    return form;
  }

  async update(
    id: string,
    updateFormInput: UpdateFormInput,
  ): Promise<PrismaForm> {
    try {
      // Check if form exists
      await this.findOne(id);

      // Extract fields from updateFormInput to handle type conversions
      // Ignore the id field as we already have it as a parameter
      const { id: _, branchId, status, ...restData } = updateFormInput;

      // Create a properly typed data object for Prisma
      const data: Prisma.FormUpdateInput = {
        ...restData,
        // Convert GraphQL FormStatusEnum to Prisma FormStatus if provided
        ...(status !== undefined && {
          status: status as unknown as FormStatus,
        }),
        // Handle branchId relation if provided
        ...(branchId !== undefined && {
          branch: { connect: { id: branchId } },
        }),
      };

      // Update the form
      return await this.prisma.form.update({
        where: { id },
        data,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new Error(
            `A form with slug "${updateFormInput.slug}" already exists.`,
          );
        }
      }
      throw error;
    }
  }

  async remove(id: string): Promise<PrismaForm> {
    // Check if form exists
    await this.findOne(id);

    // Delete the form
    return this.prisma.form.delete({
      where: { id },
    });
  }

  async getFormFields(formId: string) {
    return this.prisma.formField.findMany({
      where: { formId },
      orderBy: { order: 'asc' },
    });
  }

  async getFormSubmissions(formId: string) {
    return this.prisma.formSubmission.findMany({
      where: { formId },
      orderBy: { submittedAt: 'desc' },
    });
  }

  async incrementSubmissionCount(formId: string): Promise<void> {
    await this.prisma.form.update({
      where: { id: formId },
      data: { submissionCount: { increment: 1 } },
    });
  }

  async publishForm(id: string): Promise<PrismaForm> {
    return this.prisma.form.update({
      where: { id },
      data: { status: 'PUBLISHED' },
    });
  }

  async archiveForm(id: string): Promise<PrismaForm> {
    return this.prisma.form.update({
      where: { id },
      data: { status: 'ARCHIVED' },
    });
  }
}
