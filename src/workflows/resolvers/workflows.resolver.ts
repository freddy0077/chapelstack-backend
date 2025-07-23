import {
  Resolver,
  Query,
  Mutation,
  Args,
  Context,
  Float,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { WorkflowsService } from '../services/workflows.service';
import {
  CreateWorkflowTemplateInput,
  UpdateWorkflowTemplateInput,
  WorkflowFilterInput,
  TriggerWorkflowInput,
} from '../dto/workflow-template.input';
import {
  WorkflowTemplate,
  WorkflowExecution,
  WorkflowStats,
} from '../entities/workflow-template.entity';

@Resolver()
@UseGuards(JwtAuthGuard, RolesGuard)
export class WorkflowsResolver {
  constructor(private workflowsService: WorkflowsService) {}

  // Workflow Template Queries
  @Query(() => WorkflowTemplate)
  // @Roles('SUPER_ADMIN', 'BRANCH_ADMIN', 'SYSTEM_ADMIN', 'ADMIN', 'MODERATOR', 'USER')
  async workflowTemplate(
    @Args('id') id: string,
    @Args('organisationId') organisationId: string,
    @Args('branchId', { nullable: true }) branchId?: string,
    @Context() context?: any,
  ): Promise<WorkflowTemplate> {
    return this.workflowsService.getWorkflowTemplate(
      id,
      organisationId,
      branchId,
    );
  }

  @Query(() => [WorkflowTemplate])
  // @Roles('SUPER_ADMIN', 'BRANCH_ADMIN', 'SYSTEM_ADMIN', 'ADMIN', 'MODERATOR', 'USER')
  async workflowTemplates(
    @Args('organisationId') organisationId: string,
    @Args('branchId', { nullable: true }) branchId?: string,
    @Args('filter', { nullable: true }) filter: WorkflowFilterInput = {},
    @Context() context?: any,
  ): Promise<WorkflowTemplate[]> {
    return this.workflowsService.getWorkflowTemplates(
      filter,
      organisationId,
      branchId,
    );
  }

  @Query(() => WorkflowStats)
  // @Roles('SUPER_ADMIN', 'BRANCH_ADMIN', 'SYSTEM_ADMIN', 'ADMIN', 'MODERATOR', 'USER')
  async workflowStats(
    @Args('organisationId') organisationId: string,
    @Args('branchId', { nullable: true }) branchId?: string,
    @Context() context?: any,
  ): Promise<WorkflowStats> {
    return this.workflowsService.getWorkflowStats(organisationId, branchId);
  }

  // Workflow Execution Queries
  @Query(() => WorkflowExecution)
  // @Roles('SUPER_ADMIN', 'BRANCH_ADMIN', 'SYSTEM_ADMIN', 'ADMIN', 'MODERATOR', 'USER')
  async workflowExecution(
    @Args('id') id: string,
    @Args('organisationId') organisationId: string,
    @Args('branchId', { nullable: true }) branchId?: string,
    @Context() context?: any,
  ): Promise<WorkflowExecution> {
    return this.workflowsService.getWorkflowExecution(
      id,
      organisationId,
      branchId,
    );
  }

  @Query(() => [WorkflowExecution])
  // @Roles('SUPER_ADMIN', 'BRANCH_ADMIN', 'SYSTEM_ADMIN', 'ADMIN', 'MODERATOR', 'USER')
  async workflowExecutions(
    @Args('organisationId') organisationId: string,
    @Args('branchId', { nullable: true }) branchId?: string,
    @Args('workflowId', { nullable: true }) workflowId?: string,
    @Args('limit', { defaultValue: 50, type: () => Float }) limit: number = 50,
    @Context() context?: any,
  ): Promise<WorkflowExecution[]> {
    return this.workflowsService.getWorkflowExecutions(
      workflowId,
      organisationId,
      branchId,
      limit,
    );
  }

  // Workflow Template Mutations
  @Mutation(() => WorkflowTemplate)
  // @Roles('SUPER_ADMIN', 'BRANCH_ADMIN', 'SYSTEM_ADMIN', 'ADMIN', 'MODERATOR', 'USER')
  async createWorkflowTemplate(
    @Args('input') input: CreateWorkflowTemplateInput,
    @Args('organisationId') organisationId: string,
    @Args('branchId', { nullable: true }) branchId?: string,
    @Context() context?: any,
  ): Promise<WorkflowTemplate> {
    const user = context?.req?.user;

    // Set the organisation and branch in the input
    input.organisationId = organisationId;
    input.branchId = branchId;

    return this.workflowsService.createWorkflowTemplate(
      input,
      user?.id || 'system',
    );
  }

  @Mutation(() => WorkflowTemplate)
  // @Roles('SUPER_ADMIN', 'BRANCH_ADMIN', 'SYSTEM_ADMIN', 'ADMIN', 'MODERATOR', 'USER')
  async updateWorkflowTemplate(
    @Args('id') id: string,
    @Args('input') input: UpdateWorkflowTemplateInput,
    @Args('organisationId') organisationId: string,
    @Args('branchId', { nullable: true }) branchId?: string,
    @Context() context?: any,
  ): Promise<WorkflowTemplate> {
    return this.workflowsService.updateWorkflowTemplate(
      id,
      input,
      organisationId,
      branchId,
    );
  }

  @Mutation(() => Boolean)
  // @Roles('SUPER_ADMIN', 'BRANCH_ADMIN', 'SYSTEM_ADMIN', 'ADMIN', 'MODERATOR', 'USER')
  async deleteWorkflowTemplate(
    @Args('id') id: string,
    @Args('organisationId') organisationId: string,
    @Args('branchId', { nullable: true }) branchId?: string,
    @Context() context?: any,
  ): Promise<boolean> {
    return this.workflowsService.deleteWorkflowTemplate(
      id,
      organisationId,
      branchId,
    );
  }

  // Workflow Execution Mutations
  @Mutation(() => WorkflowExecution)
  // @Roles('SUPER_ADMIN', 'BRANCH_ADMIN', 'SYSTEM_ADMIN', 'ADMIN', 'MODERATOR', 'USER')
  async triggerWorkflow(
    @Args('input') input: TriggerWorkflowInput,
    @Context() context: any,
  ): Promise<WorkflowExecution> {
    const user = context.req.user;
    return this.workflowsService.triggerWorkflow(input, user.id);
  }

  @Mutation(() => Boolean)
  // @Roles('SUPER_ADMIN', 'BRANCH_ADMIN', 'SYSTEM_ADMIN', 'ADMIN', 'MODERATOR', 'USER')
  async cancelWorkflowExecution(
    @Args('executionId') executionId: string,
    @Context() context: any,
  ): Promise<boolean> {
    const user = context.req.user;
    const organisationId = user.organisationId;
    const branchId = user.role === 'SUPER_ADMIN' ? undefined : user.branchId;

    return this.workflowsService.cancelExecution(
      executionId,
      organisationId,
      branchId,
    );
  }

  @Mutation(() => WorkflowExecution)
  // @Roles('SUPER_ADMIN', 'BRANCH_ADMIN', 'SYSTEM_ADMIN')
  async retryWorkflowExecution(
    @Args('executionId') executionId: string,
    @Context() context: any,
  ): Promise<WorkflowExecution> {
    const user = context.req.user;
    const organisationId = user.organisationId;
    const branchId = user.role === 'SUPER_ADMIN' ? undefined : user.branchId;

    return this.workflowsService.retryExecution(
      executionId,
      organisationId,
      branchId,
    );
  }

  // Utility Mutations
  @Mutation(() => [WorkflowTemplate])
  // @Roles('SUPER_ADMIN', 'BRANCH_ADMIN', 'SYSTEM_ADMIN', 'ADMIN', 'MODERATOR', 'USER')
  async createPredefinedWorkflows(
    @Args('organisationId', { nullable: true }) organisationId?: string,
    @Args('branchId', { nullable: true }) branchId?: string,
    @Context() context?: any,
  ): Promise<WorkflowTemplate[]> {
    const user = context?.req?.user;

    // Use provided organisationId or fallback to user context
    const finalOrganisationId = organisationId || user?.organisationId;
    const finalBranchId =
      branchId || (user?.role === 'SUPER_ADMIN' ? undefined : user?.branchId);

    console.log('createPredefinedWorkflows called with:', {
      providedOrganisationId: organisationId,
      providedBranchId: branchId,
      userOrganisationId: user?.organisationId,
      userBranchId: user?.branchId,
      finalOrganisationId,
      finalBranchId,
    });

    if (!finalOrganisationId) {
      throw new Error('organisationId is required to create workflows');
    }

    return this.workflowsService.createPredefinedWorkflows(
      finalOrganisationId,
      finalBranchId,
      user?.id || 'system',
    );
  }

  // Integration Methods (called by other services)
  async handleMemberCreated(
    memberId: string,
    organisationId: string,
    branchId?: string,
  ) {
    return this.workflowsService.handleMemberCreated(
      memberId,
      organisationId,
      branchId,
    );
  }

  async handleMemberUpdated(
    memberId: string,
    organisationId: string,
    branchId?: string,
    changes?: any,
  ) {
    return this.workflowsService.handleMemberUpdated(
      memberId,
      organisationId,
      branchId,
      changes,
    );
  }

  async handleEventCreated(
    eventId: string,
    organisationId: string,
    branchId?: string,
  ) {
    return this.workflowsService.handleEventCreated(
      eventId,
      organisationId,
      branchId,
    );
  }

  async handleDonationReceived(
    transactionId: string,
    organisationId: string,
    branchId?: string,
  ) {
    return this.workflowsService.handleDonationReceived(
      transactionId,
      organisationId,
      branchId,
    );
  }

  async handleAttendanceRecorded(
    attendanceId: string,
    memberId: string,
    organisationId: string,
    branchId?: string,
  ) {
    return this.workflowsService.handleAttendanceRecorded(
      attendanceId,
      memberId,
      organisationId,
      branchId,
    );
  }
}
