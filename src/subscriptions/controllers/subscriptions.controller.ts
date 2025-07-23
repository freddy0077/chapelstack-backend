import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { RequirePermissions } from '../../auth/decorators/require-permissions.decorator';
import { SubscriptionsService } from '../services/subscriptions.service';
import { SubscriptionPlansService } from '../services/subscription-plans.service';
import { PaystackService } from '../services/paystack.service';
import { CreateSubscriptionInput } from '../dto/create-subscription.input';
import { UpdateSubscriptionInput } from '../dto/update-subscription.input';
import { SubscriptionFilterInput } from '../dto/subscription-filter.input';
import { CreatePlanDto } from '../dto/create-plan.dto';
import { UpdatePlanDto } from '../dto/update-plan.dto';
import { PlanFilterInput } from '../dto/plan-filter.input';

@Controller('subscriptions')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SubscriptionsController {
  constructor(
    private readonly subscriptionsService: SubscriptionsService,
    private readonly subscriptionPlansService: SubscriptionPlansService,
    private readonly paystackService: PaystackService,
  ) {}

  // Subscription Plans endpoints
  @Get('plans')
  @RequirePermissions({ action: 'read', subject: 'SubscriptionPlan' })
  async getPlans(@Query() filter: PlanFilterInput) {
    return this.subscriptionPlansService.getPlans(filter);
  }

  @Get('plans/:id')
  @RequirePermissions({ action: 'read', subject: 'SubscriptionPlan' })
  async getPlan(@Param('id') id: string) {
    return this.subscriptionPlansService.getPlan(id);
  }

  @Post('plans')
  @RequirePermissions({ action: 'create', subject: 'SubscriptionPlan' })
  async createPlan(@Body() input: CreatePlanDto) {
    // Convert CreatePlanDto to CreatePlanInput format
    const planInput = {
      name: input.name,
      description: input.description,
      amount: input.amount,
      currency: input.currency || 'GHS',
      interval: input.interval,
      intervalCount: input.intervalCount || 1,
      trialPeriodDays: input.trialPeriodDays || 0,
      features: input.features || [],
      isActive: input.isActive !== false,
      organisationId: input.organisationId,
    };
    return this.subscriptionPlansService.createPlan(planInput);
  }

  @Put('plans/:id')
  @RequirePermissions({ action: 'update', subject: 'SubscriptionPlan' })
  async updatePlan(@Param('id') id: string, @Body() input: UpdatePlanDto) {
    return this.subscriptionPlansService.updatePlan(id, input);
  }

  @Delete('plans/:id')
  @RequirePermissions({ action: 'delete', subject: 'SubscriptionPlan' })
  async deletePlan(@Param('id') id: string) {
    return this.subscriptionPlansService.deletePlan(id);
  }

  @Get('plans/stats')
  @RequirePermissions({ action: 'read', subject: 'SubscriptionPlan' })
  async getPlanStats(@Query('organisationId') organisationId?: string) {
    return this.subscriptionPlansService.getPlanStats(organisationId);
  }

  // Subscriptions endpoints
  @Get()
  @RequirePermissions({ action: 'read', subject: 'Subscription' })
  async getSubscriptions(@Query() filter: SubscriptionFilterInput) {
    return this.subscriptionsService.getSubscriptions(filter);
  }

  @Get(':id')
  @RequirePermissions({ action: 'read', subject: 'Subscription' })
  async getSubscription(@Param('id') id: string) {
    return this.subscriptionsService.getSubscription(id);
  }

  @Post()
  @RequirePermissions({ action: 'create', subject: 'Subscription' })
  async createSubscription(@Body() input: CreateSubscriptionInput) {
    return this.subscriptionsService.createSubscription(input);
  }

  @Put(':id')
  @RequirePermissions({ action: 'update', subject: 'Subscription' })
  async updateSubscription(
    @Param('id') id: string,
    @Body() input: UpdateSubscriptionInput,
  ) {
    return this.subscriptionsService.updateSubscription(id, input);
  }

  @Post(':id/cancel')
  @RequirePermissions({ action: 'update', subject: 'Subscription' })
  @HttpCode(HttpStatus.OK)
  async cancelSubscription(
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ) {
    return this.subscriptionsService.cancelSubscription(id, reason);
  }

  @Get('stats')
  @RequirePermissions({ action: 'read', subject: 'Subscription' })
  async getSubscriptionStats(@Query('organisationId') organisationId?: string) {
    return this.subscriptionsService.getSubscriptionStats(organisationId);
  }

  // Payment initialization endpoint
  @Post('initialize-payment')
  @RequirePermissions({ action: 'create', subject: 'Subscription' })
  async initializePayment(
    @Body()
    data: {
      email: string;
      amount: number;
      currency?: string;
      planId?: string;
      metadata?: any;
    },
  ) {
    return this.paystackService.initializeTransaction({
      email: data.email,
      amount: data.amount,
      currency: data.currency || 'GHS',
      plan: data.planId,
      metadata: data.metadata,
    });
  }

  // Payment verification endpoint
  @Get('verify-payment/:reference')
  @RequirePermissions({ action: 'read', subject: 'Subscription' })
  async verifyPayment(@Param('reference') reference: string) {
    return this.paystackService.verifyTransaction(reference);
  }
}
