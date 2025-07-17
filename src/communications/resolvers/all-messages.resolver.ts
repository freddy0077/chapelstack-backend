import { Query, Resolver, Args, Context } from '@nestjs/graphql';
import { Logger } from '@nestjs/common';
import { MessageUnion } from '../unions/message-union';
import { EmailService } from '../services/email.service';
import { SmsService } from '../services/sms.service';
import { NotificationService } from '../services/notification.service';
import { AllMessagesFilterInput } from '../dto/all-messages-filter.input';

@Resolver(() => MessageUnion)
export class AllMessagesResolver {
  private readonly logger = new Logger(AllMessagesResolver.name);

  constructor(
    private readonly emailService: EmailService,
    private readonly smsService: SmsService,
    private readonly notificationService: NotificationService,
  ) {}

  @Query(() => [MessageUnion])
  async allMessages(
    @Args('filter', { nullable: true }) filter?: AllMessagesFilterInput,
    @Context() context?: any,
  ): Promise<Array<typeof MessageUnion>> {
    // Debug the entire GraphQL context and request
    this.logger.log(
      `GraphQL context: ${JSON.stringify(context?.req?.body || {})}`,
    );

    // If filter is empty but exists in the request body, use that instead
    if (
      (!filter || Object.keys(filter).length === 0) &&
      context?.req?.body?.variables?.filter
    ) {
      this.logger.log(
        'Filter is empty but exists in request body, using that instead',
      );
      filter = context.req.body.variables.filter;
    }

    // Log the raw filter input with more detail
    this.logger.log(`Raw filter input: ${JSON.stringify(filter)}`);
    this.logger.log(
      `Filter branchId type: ${filter?.branchId ? typeof filter.branchId : 'undefined'}`,
    );
    this.logger.log(
      `Filter organisationId type: ${filter?.organisationId ? typeof filter.organisationId : 'undefined'}`,
    );

    // Ensure we have valid string values for IDs (not empty strings)
    // More robust validation to handle edge cases
    const branchId =
      filter?.branchId &&
      typeof filter.branchId === 'string' &&
      filter.branchId.trim() !== ''
        ? filter.branchId.trim()
        : undefined;

    const organisationId =
      filter?.organisationId &&
      typeof filter.organisationId === 'string' &&
      filter.organisationId.trim() !== ''
        ? filter.organisationId.trim()
        : undefined;

    const startDate = filter?.startDate
      ? new Date(filter.startDate)
      : undefined;
    const endDate = filter?.endDate ? new Date(filter.endDate) : undefined;
    const types = filter?.types;

    this.logger.log(
      `Filter processed: organisationId=${organisationId}, branchId=${branchId}, types=${types}, startDate=${startDate}, endDate=${endDate}`,
    );

    // If neither organisationId nor branchId is provided, return empty array
    // This prevents returning all messages across all organizations
    if (!organisationId && !branchId) {
      this.logger.log(
        'No organisationId or branchId provided, returning empty array',
      );
      return [];
    }

    // Fetch messages with filtering
    this.logger.debug(
      `Calling emailService.getEmails with branchId=${branchId}, organisationId=${organisationId}`,
    );
    const emails =
      types && !types.includes('email')
        ? []
        : await this.emailService.getEmails(branchId, organisationId);

    this.logger.debug(
      `Calling smsService.getSms with branchId=${branchId}, organisationId=${organisationId}`,
    );
    const sms =
      types && !types.includes('sms')
        ? []
        : await this.smsService.getSms(branchId, organisationId);

    this.logger.debug(
      `Calling notificationService.getNotifications with branchId=${branchId}, organisationId=${organisationId}`,
    );
    const notifications =
      types && !types.includes('notification')
        ? []
        : await this.notificationService.getNotifications(
            branchId,
            organisationId,
          );

    this.logger.log(
      `Messages fetched: emails=${emails.length}, sms=${sms.length}, notifications=${notifications.length}`,
    );

    // Sample the first few messages to check their branchId
    if (emails.length > 0) {
      this.logger.debug(
        `Sample email: id=${emails[0].id}, branchId=${emails[0].branchId}, organisationId=${emails[0].organisationId}`,
      );
    }
    if (sms.length > 0) {
      this.logger.debug(
        `Sample SMS: id=${sms[0].id}, branchId=${sms[0].branchId}, organisationId=${sms[0].organisationId}`,
      );
    }
    if (notifications.length > 0) {
      this.logger.debug(
        `Sample notification: id=${notifications[0].id}, branchId=${notifications[0].branchId}, organisationId=${notifications[0].organisationId}`,
      );
    }

    // Merge and filter by date
    let all = [
      ...emails.map((m) => ({ ...m, _sortDate: m.sentAt || m.createdAt })),
      ...sms.map((m) => ({ ...m, _sortDate: m.sentAt || m.createdAt })),
      ...notifications.map((m) => ({ ...m, _sortDate: m.createdAt })),
    ];

    // Add additional filtering to ensure all messages match the organization and branch filters
    if (organisationId) {
      const beforeCount = all.length;
      all = all.filter((m) => m.organisationId === organisationId);
      this.logger.log(
        `Additional organisationId filter: ${beforeCount} -> ${all.length} messages`,
      );
    }

    if (branchId) {
      const beforeCount = all.length;
      all = all.filter((m) => m.branchId === branchId);
      this.logger.log(
        `Additional branchId filter: ${beforeCount} -> ${all.length} messages`,
      );
    }

    if (startDate) {
      const beforeCount = all.length;
      all = all.filter((m) => new Date(m._sortDate) >= startDate);
      this.logger.debug(
        `Date filter (start): ${beforeCount} -> ${all.length} messages`,
      );
    }
    if (endDate) {
      const beforeCount = all.length;
      all = all.filter((m) => new Date(m._sortDate) <= endDate);
      this.logger.debug(
        `Date filter (end): ${beforeCount} -> ${all.length} messages`,
      );
    }

    all.sort(
      (a, b) =>
        new Date(b._sortDate).getTime() - new Date(a._sortDate).getTime(),
    );

    this.logger.log(`Total messages after filtering: ${all.length}`);

    return all;
  }
}
