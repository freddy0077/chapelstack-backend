import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFormFieldInput } from '../dto/create-form-field.input';
import { UpdateFormFieldInput } from '../dto/update-form-field.input';
import { FormField as PrismaFormField } from '@prisma/client';

@Injectable()
export class FormFieldsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createFormFieldInput: CreateFormFieldInput,
  ): Promise<PrismaFormField> {
    // Verify that the form exists
    const form = await this.prisma.form.findUnique({
      where: { id: createFormFieldInput.formId },
    });

    if (!form) {
      throw new NotFoundException(
        `Form with ID ${createFormFieldInput.formId} not found`,
      );
    }

    return this.prisma.formField.create({
      data: createFormFieldInput,
    });
  }

  async createMany(fields: CreateFormFieldInput[]): Promise<PrismaFormField[]> {
    if (!fields.length) return [];

    // Verify that the form exists
    const formId = fields[0].formId;
    const form = await this.prisma.form.findUnique({
      where: { id: formId },
    });

    if (!form) {
      throw new NotFoundException(`Form with ID ${formId} not found`);
    }

    // Create all fields in a transaction
    const createdFields = await this.prisma.$transaction(
      fields.map((field) =>
        this.prisma.formField.create({
          data: field,
        }),
      ),
    );

    return createdFields;
  }

  async findAll(formId: string): Promise<PrismaFormField[]> {
    return this.prisma.formField.findMany({
      where: { formId },
      orderBy: { order: 'asc' },
    });
  }

  async findOne(id: string): Promise<PrismaFormField> {
    const field = await this.prisma.formField.findUnique({
      where: { id },
    });

    if (!field) {
      throw new NotFoundException(`Form field with ID ${id} not found`);
    }

    return field;
  }

  async update(
    id: string,
    updateFormFieldInput: UpdateFormFieldInput,
  ): Promise<PrismaFormField> {
    // Check if field exists
    await this.findOne(id);

    // Update the field
    return this.prisma.formField.update({
      where: { id },
      data: updateFormFieldInput,
    });
  }

  async remove(id: string): Promise<PrismaFormField> {
    // Check if field exists
    await this.findOne(id);

    // Delete the field
    return this.prisma.formField.delete({
      where: { id },
    });
  }

  async reorderFields(
    formId: string,
    fieldIds: string[],
  ): Promise<PrismaFormField[]> {
    // Verify that the form exists
    const form = await this.prisma.form.findUnique({
      where: { id: formId },
    });

    if (!form) {
      throw new NotFoundException(`Form with ID ${formId} not found`);
    }

    // Verify that all fields exist and belong to the form
    const existingFields = await this.prisma.formField.findMany({
      where: { formId },
    });

    const existingFieldIds = existingFields.map((field) => field.id);
    const allFieldsExist = fieldIds.every((id) =>
      existingFieldIds.includes(id),
    );

    if (!allFieldsExist) {
      throw new Error(
        'One or more field IDs are invalid or do not belong to this form',
      );
    }

    // Update the order of each field
    const updates = fieldIds.map((fieldId, index) =>
      this.prisma.formField.update({
        where: { id: fieldId },
        data: { order: index },
      }),
    );

    return this.prisma.$transaction(updates);
  }
}
