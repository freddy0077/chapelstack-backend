import { Query, Resolver, Args } from '@nestjs/graphql';
import { MessageUnion } from '../unions/message-union';
import { EmailService } from '../services/email.service';
import { SmsService } from '../services/sms.service';
import { NotificationService } from '../services/notification.service';
import { AllMessagesFilterInput } from '../dto/all-messages-filter.input';

@Resolver(() => MessageUnion)
export class AllMessagesResolver {
  constructor(
    private readonly emailService: EmailService,
    private readonly smsService: SmsService,
    private readonly notificationService: NotificationService,
  ) {}

  @Query(() => [MessageUnion])
  async allMessages(
    @Args('filter', { nullable: true }) filter?: AllMessagesFilterInput,
  ): Promise<Array<typeof MessageUnion>> {
    const branchId = filter?.branchId;
    const organisationId = filter?.organisationId;
    const startDate = filter?.startDate
      ? new Date(filter.startDate)
      : undefined;
    const endDate = filter?.endDate ? new Date(filter.endDate) : undefined;
    const types = filter?.types;

    // Fetch messages with optional branchId filtering
    const emails =
      types && !types.includes('email')
        ? []
        : await this.emailService.getEmails(branchId, organisationId);
    const sms =
      types && !types.includes('sms')
        ? []
        : await this.smsService.getSms(branchId, organisationId);
    const notifications =
      types && !types.includes('notification')
        ? []
        : await this.notificationService.getNotifications(
            branchId,
            organisationId,
          );

    // Merge and filter by date
    let all = [
      ...emails.map((m) => ({ ...m, _sortDate: m.sentAt || m.createdAt })),
      ...sms.map((m) => ({ ...m, _sortDate: m.sentAt || m.createdAt })),
      ...notifications.map((m) => ({ ...m, _sortDate: m.createdAt })),
    ];

    if (startDate) {
      all = all.filter((m) => new Date(m._sortDate) >= startDate);
    }
    if (endDate) {
      all = all.filter((m) => new Date(m._sortDate) <= endDate);
    }

    all.sort(
      (a, b) =>
        new Date(b._sortDate).getTime() - new Date(a._sortDate).getTime(),
    );
    return all;
  }
}
