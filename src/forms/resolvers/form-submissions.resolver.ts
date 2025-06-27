import {
  Resolver,
  Query,
  Mutation,
  Args,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { FormSubmissionsService } from '../services/form-submissions.service';
import { FormSubmission } from '../entities/form-submission.entity';
import { CreateFormSubmissionInput } from '../dto/create-form-submission.input';
import { SubmissionFilterInput } from '../dto/submission-filter.input';
import { Form } from '../entities/form.entity';
import { FormFieldValue } from '../entities/form-field-value.entity';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../../auth/guards/gql-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator';
import { PrismaService } from '../../prisma/prisma.service';
import { GraphQLJSON } from 'graphql-type-json';
import { User } from '../../users/entities/user.entity';
import { Branch } from '../../branches/entities/branch.entity';
import { SubmissionStatus } from '../enums/submission-status.enum';

@Resolver(() => FormSubmission)
export class FormSubmissionsResolver {
  constructor(
    private readonly formSubmissionsService: FormSubmissionsService,
    private readonly prisma: PrismaService,
  ) {}

  @Mutation(() => FormSubmission)
  async submitForm(
    @Args('input') createSubmissionInput: CreateFormSubmissionInput,
  ): Promise<FormSubmission> {
    try {
      const submission = await this.formSubmissionsService.create(
        createSubmissionInput,
      );
      // Convert Prisma model to GraphQL entity
      return {
        ...submission,
        status: submission.status as SubmissionStatus,
        form: null, // Will be resolved by form field resolver
        fieldValues: null, // Will be resolved by fieldValues field resolver
      };
    } catch (error) {
      throw new Error(
        `Failed to submit form: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  @Query(() => [FormSubmission])
  @UseGuards(GqlAuthGuard, PermissionsGuard)
  @RequirePermissions({ action: 'read', subject: 'FormSubmission' })
  async formSubmissions(
    @Args('filter') filter: SubmissionFilterInput,
  ): Promise<FormSubmission[]> {
    try {
      const submissions = await this.formSubmissionsService.findAll(filter);
      // Convert Prisma models to GraphQL entities
      return submissions.map((submission) => ({
        ...submission,
        status: submission.status as SubmissionStatus,
        form: null, // Will be resolved by form field resolver
        fieldValues: null, // Will be resolved by fieldValues field resolver
      }));
    } catch (error) {
      throw new Error(
        `Failed to fetch form submissions: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  @Query(() => FormSubmission)
  @UseGuards(GqlAuthGuard, PermissionsGuard)
  @RequirePermissions({ action: 'read', subject: 'FormSubmission' })
  async formSubmission(@Args('id') id: string): Promise<FormSubmission> {
    try {
      const submission = await this.formSubmissionsService.findOne(id);
      if (!submission) {
        throw new Error(`Form submission with ID ${id} not found`);
      }
      // Convert Prisma model to GraphQL entity
      return {
        ...submission,
        status: submission.status as SubmissionStatus,
        form: null, // Will be resolved by form field resolver
        fieldValues: null, // Will be resolved by fieldValues field resolver
      };
    } catch (error) {
      throw new Error(
        `Failed to fetch form submission: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  @Mutation(() => FormSubmission)
  @UseGuards(GqlAuthGuard, PermissionsGuard)
  @RequirePermissions({ action: 'delete', subject: 'FormSubmission' })
  async removeFormSubmission(@Args('id') id: string): Promise<FormSubmission> {
    try {
      const submission = await this.formSubmissionsService.remove(id);
      if (!submission) {
        throw new Error(`Form submission with ID ${id} not found`);
      }
      // Convert Prisma model to GraphQL entity
      return {
        ...submission,
        status: submission.status as SubmissionStatus,
        form: null, // Will be resolved by form field resolver
        fieldValues: null, // Will be resolved by fieldValues field resolver
      };
    } catch (error) {
      throw new Error(
        `Failed to remove form submission: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  @Query(() => GraphQLJSON)
  @UseGuards(GqlAuthGuard, PermissionsGuard)
  @RequirePermissions({ action: 'read', subject: 'FormSubmission' })
  async exportFormSubmissions(
    @Args('formId') formId: string,
  ): Promise<Record<string, unknown>> {
    try {
      const exportData =
        await this.formSubmissionsService.exportSubmissions(formId);

      // Ensure we return a proper Record<string, unknown> type
      if (Array.isArray(exportData)) {
        // If it's an array, convert it to a record with an 'items' property
        return { items: exportData } as Record<string, unknown>;
      }

      return exportData as Record<string, unknown>;
    } catch (error) {
      throw new Error(
        `Failed to export form submissions: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  @ResolveField(() => Form)
  async form(@Parent() submission: FormSubmission): Promise<Form | null> {
    try {
      if (!submission.formId) {
        return null;
      }
      const form = await this.prisma.form.findUnique({
        where: { id: submission.formId },
      });
      return form;
    } catch (error) {
      console.error(
        `Error resolving form: ${error instanceof Error ? error.message : String(error)}`,
      );
      return null;
    }
  }

  @ResolveField(() => [FormFieldValue])
  async fieldValues(
    @Parent() submission: FormSubmission,
  ): Promise<FormFieldValue[]> {
    try {
      if (!submission.id) {
        return [];
      }
      const fieldValues = await this.formSubmissionsService.getFieldValues(
        submission.id,
      );
      return fieldValues.map((value) => ({
        ...value,
        submission: value.submissionId ? { id: value.submissionId } : null,
        field: null, // Will be resolved by field resolver if needed
      }));
    } catch (error) {
      console.error(
        `Error resolving field values: ${error instanceof Error ? error.message : String(error)}`,
      );
      return [];
    }
  }

  @ResolveField(() => User, { nullable: true })
  async submittedBy(
    @Parent() submission: FormSubmission,
  ): Promise<User | null> {
    try {
      if (!submission.submittedById) return null;
      const user = await this.prisma.user.findUnique({
        where: { id: submission.submittedById },
      });
      if (!user) return null;
      return {
        ...user,
        // Ensure name is a string, not null
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || '',
      };
    } catch (error) {
      console.error(
        `Error resolving submittedBy: ${error instanceof Error ? error.message : String(error)}`,
      );
      return null;
    }
  }

  @ResolveField(() => Branch, { nullable: true })
  async branch(@Parent() submission: FormSubmission): Promise<Branch | null> {
    try {
      if (!submission.branchId) return null;
      const branch = await this.prisma.branch.findUnique({
        where: { id: submission.branchId },
      });
      if (!branch) return null;
      return {
        ...branch,
        settings: null, // This will be resolved by a separate resolver if needed
      };
    } catch (error) {
      console.error(
        `Error resolving branch: ${error instanceof Error ? error.message : String(error)}`,
      );
      return null;
    }
  }
}
