import { Resolver, Mutation, Query, Args, InputType, Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { NotificationsFacade } from '../../notifications/notifications.facade';
import { EmailService } from '../../../communications/services/email.service';
import { SmsService } from '../../../communications/services/sms.service';

enum NotificationChannelEnum {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
}
registerEnumType(NotificationChannelEnum, { name: 'NotificationChannel' });

@InputType()
class RecipientInputGQL {
  @Field({ nullable: true }) id?: string;
  @Field({ nullable: true }) email?: string;
  @Field({ nullable: true }) phone?: string;
  @Field({ nullable: true }) name?: string;
}

@InputType()
class SendNotificationInputGQL {
  @Field(() => NotificationChannelEnum)
  channel!: NotificationChannelEnum;

  @Field(() => [RecipientInputGQL])
  recipients!: RecipientInputGQL[];

  @Field({ nullable: true }) templateKey?: string;
  @Field({ nullable: true }) templateId?: string;
  @Field(() => String, { nullable: true }) variablesJson?: string; // JSON serialized variables
  @Field({ nullable: true }) scheduleAt?: Date;
  @Field({ nullable: true }) branchId?: string;
  @Field({ nullable: true }) organisationId?: string;
  @Field(() => [String], { nullable: true }) groupIds?: string[];
  @Field(() => String, { nullable: true }) filtersJson?: string; // JSON serialized filters
  @Field({ nullable: true }) birthdayRange?: string;
}

@ObjectType()
class SendNotificationResult {
  @Field() success!: boolean;
  @Field() count!: number;
}

@ObjectType()
class NotificationStatsResult {
  @Field() emailsSentLast30Days!: number;
  @Field() smsSentLast30Days!: number;
  @Field() totalSent!: number;
}

@Resolver()
export class NotificationsResolver {
  constructor(
    private readonly notifications: NotificationsFacade,
    private readonly emailService: EmailService,
    private readonly smsService: SmsService,
  ) {}

  @Mutation(() => SendNotificationResult)
  async sendNotification(
    @Args('input') input: SendNotificationInputGQL,
  ): Promise<SendNotificationResult> {
    const variables = input.variablesJson ? JSON.parse(input.variablesJson) : {};
    const filters = input.filtersJson ? JSON.parse(input.filtersJson) : undefined;
    const result = await this.notifications.send({
      channel: input.channel,
      recipients: input.recipients,
      templateKey: input.templateKey,
      templateId: input.templateId,
      variables,
      scheduleAt: input.scheduleAt ?? null,
      branchId: input.branchId,
      organisationId: input.organisationId,
      groupIds: input.groupIds,
      filters,
      birthdayRange: input.birthdayRange as any,
    });
    return { success: result.success, count: result.count };
  }

  @Query(() => String)
  async previewTemplate(
    @Args('templateKey') templateKey: string,
    @Args('variablesJson', { nullable: true }) variablesJson?: string,
  ): Promise<string> {
    const variables = variablesJson ? JSON.parse(variablesJson) : {};
    // Simple preview: interpolate variables into templateKey
    let output = templateKey || '';
    for (const [k, v] of Object.entries(variables)) {
      const re = new RegExp(`{{\\s*${k}\\s*}}`, 'g');
      output = output.replace(re, String(v));
    }
    return output;
  }

  @Query(() => NotificationStatsResult)
  async notificationStats(
    @Args('branchId', { nullable: true }) branchId?: string,
    @Args('organisationId', { nullable: true }) organisationId?: string,
  ): Promise<NotificationStatsResult> {
    // Get counts from existing services
    const emailCount = await this.emailService.countSentLast30Days();
    const smsCount = await this.smsService.countSentLast30Days();

    return {
      emailsSentLast30Days: emailCount,
      smsSentLast30Days: smsCount,
      totalSent: emailCount + smsCount,
    };
  }
}
