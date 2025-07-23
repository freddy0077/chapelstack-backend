import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { CreatePlanDto } from '../dto/create-plan.dto';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { CreateSubscriptionDto } from '../dto/create-subscription.dto';
import { PaystackResponse } from '../interfaces/paystack-response.interface';

@Injectable()
export class PaystackService {
  private readonly logger: Logger;
  private readonly baseUrl = 'https://api.paystack.co';
  private readonly secretKey: string;
  private readonly publicKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.secretKey =
      this.configService.get<string>('PAYSTACK_SECRET_KEY') || '';
    this.publicKey =
      this.configService.get<string>('PAYSTACK_PUBLIC_KEY') || '';

    // Only require keys in production environment
    const nodeEnv = this.configService.get<string>('NODE_ENV');
    if (nodeEnv === 'production' && !this.secretKey) {
      throw new Error('PAYSTACK_SECRET_KEY is required in production');
    }

    if (nodeEnv === 'production' && !this.publicKey) {
      throw new Error('PAYSTACK_PUBLIC_KEY is required in production');
    }

    this.logger = new Logger(PaystackService.name);
  }

  /**
   * Create a subscription plan on Paystack
   */
  async createPlan(planData: CreatePlanDto): Promise<PaystackResponse> {
    try {
      this.logger.log(`Creating Paystack plan: ${planData.name}`);

      const response = await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/plan`,
          {
            name: planData.name,
            amount: Math.round(planData.amount * 100), // Convert to kobo
            interval: planData.interval.toLowerCase(),
            currency: planData.currency || 'GHS',
            description: planData.description,
            invoice_limit: planData.invoiceLimit,
            send_invoices: planData.sendInvoices,
            send_sms: planData.sendSms,
          },
          { headers: this.getHeaders() },
        ),
      );

      this.logger.log(
        `Paystack plan created successfully: ${response.data.data.plan_code}`,
      );
      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to create Paystack plan: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Failed to create plan: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  /**
   * Update a subscription plan on Paystack
   */
  async updatePlan(
    planCode: string,
    planData: Partial<CreatePlanDto>,
  ): Promise<PaystackResponse> {
    try {
      this.logger.log(`Updating Paystack plan: ${planCode}`);

      const updateData: any = {};
      if (planData.name) updateData.name = planData.name;
      if (planData.description) updateData.description = planData.description;
      if (planData.amount)
        updateData.amount = Math.round(planData.amount * 100);
      if (planData.currency) updateData.currency = planData.currency;
      if (planData.interval)
        updateData.interval = planData.interval.toLowerCase();
      if (planData.invoiceLimit !== undefined)
        updateData.invoice_limit = planData.invoiceLimit;
      if (planData.sendInvoices !== undefined)
        updateData.send_invoices = planData.sendInvoices;
      if (planData.sendSms !== undefined)
        updateData.send_sms = planData.sendSms;

      const response = await firstValueFrom(
        this.httpService.put(`${this.baseUrl}/plan/${planCode}`, updateData, {
          headers: this.getHeaders(),
        }),
      );

      this.logger.log(`Paystack plan updated successfully: ${planCode}`);
      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to update Paystack plan: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Failed to update plan: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  /**
   * Create a customer on Paystack
   */
  async createCustomer(
    customerData: CreateCustomerDto,
  ): Promise<PaystackResponse> {
    try {
      this.logger.log(`Creating Paystack customer: ${customerData.email}`);

      const response = await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/customer`,
          {
            email: customerData.email,
            first_name: customerData.firstName,
            last_name: customerData.lastName,
            phone: customerData.phone,
            metadata: customerData.metadata,
          },
          { headers: this.getHeaders() },
        ),
      );

      this.logger.log(
        `Paystack customer created successfully: ${response.data.data.customer_code}`,
      );
      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to create Paystack customer: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Failed to create customer: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  /**
   * Update a customer on Paystack
   */
  async updateCustomer(
    customerCode: string,
    customerData: Partial<CreateCustomerDto>,
  ): Promise<PaystackResponse> {
    try {
      this.logger.log(`Updating Paystack customer: ${customerCode}`);

      const updateData: any = {};
      if (customerData.firstName)
        updateData.first_name = customerData.firstName;
      if (customerData.lastName) updateData.last_name = customerData.lastName;
      if (customerData.phone) updateData.phone = customerData.phone;
      if (customerData.metadata) updateData.metadata = customerData.metadata;

      const response = await firstValueFrom(
        this.httpService.put(
          `${this.baseUrl}/customer/${customerCode}`,
          updateData,
          { headers: this.getHeaders() },
        ),
      );

      this.logger.log(
        `Paystack customer updated successfully: ${customerCode}`,
      );
      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to update Paystack customer: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Failed to update customer: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  /**
   * Create a subscription on Paystack
   */
  async createSubscription(
    subscriptionData: CreateSubscriptionDto,
  ): Promise<PaystackResponse> {
    try {
      this.logger.log(
        `Creating Paystack subscription for customer: ${subscriptionData.customer}`,
      );

      const response = await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/subscription`,
          {
            customer: subscriptionData.customer,
            plan: subscriptionData.plan,
            authorization: subscriptionData.authorization,
            start_date: subscriptionData.startDate,
            metadata: subscriptionData.metadata,
          },
          { headers: this.getHeaders() },
        ),
      );

      this.logger.log(
        `Paystack subscription created successfully: ${response.data.data.subscription_code}`,
      );
      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to create Paystack subscription: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Failed to create subscription: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  /**
   * Cancel a subscription on Paystack
   */
  async cancelSubscription(
    subscriptionCode: string,
    token: string,
  ): Promise<PaystackResponse> {
    try {
      this.logger.log(`Cancelling Paystack subscription: ${subscriptionCode}`);

      const response = await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/subscription/disable`,
          {
            code: subscriptionCode,
            token: token,
          },
          { headers: this.getHeaders() },
        ),
      );

      this.logger.log(
        `Paystack subscription cancelled successfully: ${subscriptionCode}`,
      );
      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to cancel Paystack subscription: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Failed to cancel subscription: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  /**
   * Enable a subscription on Paystack
   */
  async enableSubscription(
    subscriptionCode: string,
    token: string,
  ): Promise<PaystackResponse> {
    try {
      this.logger.log(`Enabling Paystack subscription: ${subscriptionCode}`);

      const response = await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/subscription/enable`,
          {
            code: subscriptionCode,
            token: token,
          },
          { headers: this.getHeaders() },
        ),
      );

      this.logger.log(
        `Paystack subscription enabled successfully: ${subscriptionCode}`,
      );
      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to enable Paystack subscription: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Failed to enable subscription: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  /**
   * Verify a transaction on Paystack
   */
  async verifyTransaction(reference: string): Promise<PaystackResponse> {
    try {
      this.logger.log(`Verifying Paystack transaction: ${reference}`);

      const response = await firstValueFrom(
        this.httpService.get(
          `${this.baseUrl}/transaction/verify/${reference}`,
          { headers: this.getHeaders() },
        ),
      );

      this.logger.log(
        `Paystack transaction verified successfully: ${reference}`,
      );
      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to verify Paystack transaction: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Failed to verify transaction: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  /**
   * Get subscription details from Paystack
   */
  async getSubscription(subscriptionCode: string): Promise<PaystackResponse> {
    try {
      this.logger.log(`Fetching Paystack subscription: ${subscriptionCode}`);

      const response = await firstValueFrom(
        this.httpService.get(
          `${this.baseUrl}/subscription/${subscriptionCode}`,
          { headers: this.getHeaders() },
        ),
      );

      this.logger.log(
        `Paystack subscription fetched successfully: ${subscriptionCode}`,
      );
      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to fetch Paystack subscription: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Failed to fetch subscription: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  /**
   * Initialize a transaction on Paystack
   */
  async initializeTransaction(transactionData: {
    email: string;
    amount: number;
    currency?: string;
    reference?: string;
    callback_url?: string;
    plan?: string;
    metadata?: any;
  }): Promise<PaystackResponse> {
    try {
      this.logger.log(
        `Initializing Paystack transaction for: ${transactionData.email}`,
      );

      const response = await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/transaction/initialize`,
          {
            ...transactionData,
            amount: Math.round(transactionData.amount * 100), // Convert to kobo
            currency: transactionData.currency || 'NGN',
          },
          { headers: this.getHeaders() },
        ),
      );

      this.logger.log(
        `Paystack transaction initialized successfully: ${response.data.data.reference}`,
      );
      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to initialize Paystack transaction: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Failed to initialize transaction: ${error.response?.data?.message || error.message}`,
      );
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: any, signature: string): boolean {
    try {
      const crypto = require('crypto');
      const webhookSecret = this.configService.get<string>(
        'PAYSTACK_WEBHOOK_SECRET',
      );

      if (!webhookSecret) {
        this.logger.warn('PAYSTACK_WEBHOOK_SECRET not configured');
        return false;
      }

      const hash = crypto
        .createHmac('sha512', webhookSecret)
        .update(JSON.stringify(payload))
        .digest('hex');

      return hash === signature;
    } catch (error) {
      this.logger.error(
        `Failed to verify webhook signature: ${error.message}`,
        error.stack,
      );
      return false;
    }
  }

  /**
   * Get request headers for Paystack API
   */
  private getHeaders() {
    return {
      Authorization: `Bearer ${this.secretKey}`,
      'Content-Type': 'application/json',
    };
  }
}
