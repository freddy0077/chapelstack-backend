import {
  Resolver,
  Query,
  Mutation,
  Args,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { FormsService } from '../services/forms.service';
import { Form } from '../entities/form.entity';
import { CreateFormInput } from '../dto/create-form.input';
import { UpdateFormInput } from '../dto/update-form.input';
import { FormFilterInput } from '../dto/form-filter.input';
import { FormField } from '../entities/form-field.entity';
import { FormSubmission } from '../entities/form-submission.entity';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator';
import { SubmissionStatus } from '../enums/submission-status.enum';

@Resolver(() => Form)
export class FormsResolver {
  constructor(private readonly formsService: FormsService) {}

  @Mutation(() => Form)
  @UseGuards(GqlAuthGuard, PermissionsGuard)
  @RequirePermissions({ action: 'create', subject: 'Form' })
  async createForm(
    @Args('input') createFormInput: CreateFormInput,
  ): Promise<Form> {
    return this.formsService.create(createFormInput);
  }

  @Query(() => [Form])
  @UseGuards(GqlAuthGuard, PermissionsGuard)
  @RequirePermissions({ action: 'read', subject: 'Form' })
  async forms(
    @Args('filter', { nullable: true }) filter?: FormFilterInput,
  ): Promise<Form[]> {
    return this.formsService.findAll(filter);
  }

  @Query(() => Form)
  @UseGuards(GqlAuthGuard, PermissionsGuard)
  @RequirePermissions({ action: 'read', subject: 'Form' })
  async form(@Args('id') id: string): Promise<Form> {
    return this.formsService.findOne(id);
  }

  @Query(() => Form)
  async publicForm(@Args('slug') slug: string): Promise<Form> {
    const form = await this.formsService.findBySlug(slug);

    // Only return published and public forms
    if (form.status !== 'PUBLISHED' || !form.isPublic) {
      throw new Error('Form not found or not available');
    }

    return form;
  }

  @Mutation(() => Form)
  @UseGuards(GqlAuthGuard, PermissionsGuard)
  @RequirePermissions({ action: 'update', subject: 'Form' })
  async updateForm(
    @Args('input') updateFormInput: UpdateFormInput,
  ): Promise<Form> {
    return this.formsService.update(updateFormInput.id, updateFormInput);
  }

  @Mutation(() => Form)
  @UseGuards(GqlAuthGuard, PermissionsGuard)
  @RequirePermissions({ action: 'delete', subject: 'Form' })
  async removeForm(@Args('id') id: string): Promise<Form> {
    return this.formsService.remove(id);
  }

  @Mutation(() => Form)
  @UseGuards(GqlAuthGuard, PermissionsGuard)
  @RequirePermissions({ action: 'update', subject: 'Form' })
  async publishForm(@Args('id') id: string): Promise<Form> {
    return this.formsService.publishForm(id);
  }

  @Mutation(() => Form)
  @UseGuards(GqlAuthGuard, PermissionsGuard)
  @RequirePermissions({ action: 'update', subject: 'Form' })
  async archiveForm(@Args('id') id: string): Promise<Form> {
    return this.formsService.archiveForm(id);
  }

  @ResolveField(() => [FormField])
  async fields(@Parent() form: Form): Promise<FormField[]> {
    return this.formsService.getFormFields(form.id);
  }

  @ResolveField(() => [FormSubmission])
  async submissions(@Parent() form: Form): Promise<FormSubmission[]> {
    const submissions = await this.formsService.getFormSubmissions(form.id);
    // Convert Prisma model to GraphQL entity
    return submissions.map((submission) => ({
      ...submission,
      status: submission.status as SubmissionStatus,
      form: null, // Will be resolved by form field resolver
      fieldValues: null, // Will be resolved by fieldValues field resolver
    }));
  }
}
