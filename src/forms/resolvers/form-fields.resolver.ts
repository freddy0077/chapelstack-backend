import {
  Resolver,
  Query,
  Mutation,
  Args,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { FormFieldsService } from '../services/form-fields.service';
import { FormField } from '../entities/form-field.entity';
import { CreateFormFieldInput } from '../dto/create-form-field.input';
import { UpdateFormFieldInput } from '../dto/update-form-field.input';
import { Form } from '../entities/form.entity';
import { FormFieldValue } from '../entities/form-field-value.entity';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@Resolver(() => FormField)
export class FormFieldsResolver {
  constructor(
    private readonly formFieldsService: FormFieldsService,
    private readonly prisma: PrismaService,
  ) {}

  @Mutation(() => FormField)
  @UseGuards(GqlAuthGuard, PermissionsGuard)
  @RequirePermissions({ action: 'create', subject: 'FormField' })
  async createFormField(
    @Args('input') createFormFieldInput: CreateFormFieldInput,
  ): Promise<FormField> {
    return this.formFieldsService.create(createFormFieldInput);
  }

  @Mutation(() => [FormField])
  @UseGuards(GqlAuthGuard, PermissionsGuard)
  @RequirePermissions({ action: 'create', subject: 'FormField' })
  async createFormFields(
    @Args('inputs', { type: () => [CreateFormFieldInput] })
    createFormFieldInputs: CreateFormFieldInput[],
  ): Promise<FormField[]> {
    return this.formFieldsService.createMany(createFormFieldInputs);
  }

  @Query(() => [FormField])
  @UseGuards(GqlAuthGuard, PermissionsGuard)
  @RequirePermissions({ action: 'read', subject: 'FormField' })
  async formFields(@Args('formId') formId: string): Promise<FormField[]> {
    return this.formFieldsService.findAll(formId);
  }

  @Query(() => FormField)
  @UseGuards(GqlAuthGuard, PermissionsGuard)
  @RequirePermissions({ action: 'read', subject: 'FormField' })
  async formField(@Args('id') id: string): Promise<FormField> {
    return this.formFieldsService.findOne(id);
  }

  @Mutation(() => FormField)
  @UseGuards(GqlAuthGuard, PermissionsGuard)
  @RequirePermissions({ action: 'update', subject: 'FormField' })
  async updateFormField(
    @Args('input') updateFormFieldInput: UpdateFormFieldInput,
  ): Promise<FormField> {
    return this.formFieldsService.update(
      updateFormFieldInput.id,
      updateFormFieldInput,
    );
  }

  @Mutation(() => FormField)
  @UseGuards(GqlAuthGuard, PermissionsGuard)
  @RequirePermissions({ action: 'delete', subject: 'FormField' })
  async removeFormField(@Args('id') id: string): Promise<FormField> {
    return this.formFieldsService.remove(id);
  }

  @Mutation(() => [FormField])
  @UseGuards(GqlAuthGuard, PermissionsGuard)
  @RequirePermissions({ action: 'update', subject: 'FormField' })
  async reorderFormFields(
    @Args('formId') formId: string,
    @Args('fieldIds', { type: () => [String] }) fieldIds: string[],
  ): Promise<FormField[]> {
    return this.formFieldsService.reorderFields(formId, fieldIds);
  }

  @ResolveField(() => Form)
  async form(@Parent() field: FormField): Promise<Form | null> {
    const form = await this.prisma.form.findUnique({
      where: { id: field.formId },
    });

    if (!form) return null;

    return {
      ...form,
      fields: [],
      submissions: [],
      submissionCount: 0,
    };
  }

  @ResolveField(() => [FormFieldValue])
  async fieldValues(@Parent() field: FormField): Promise<FormFieldValue[]> {
    const fieldValues = await this.prisma.formFieldValue.findMany({
      where: { fieldId: field.id },
    });

    // Map to include the missing field and submission properties
    return fieldValues.map((value) => ({
      ...value,
      field: null, // Will be resolved by another resolver if needed
      submission: null, // Will be resolved by another resolver if needed
    }));
  }
}
