import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { NotificationService } from '../services/notification.service';
import { CreateNotificationInput } from '../dto/create-notification.input';
import { NotificationDto } from '../dto/notification.dto';

@Resolver(() => NotificationDto)
export class NotificationResolver {
  constructor(private readonly notificationService: NotificationService) {}

  @Query(() => [NotificationDto])
  async notifications(
    @Args('branchId', { type: () => ID, nullable: true }) branchId?: string,
    @Args('organisationId', { type: () => ID, nullable: true })
    organisationId?: string,
  ): Promise<NotificationDto[]> {
    return this.notificationService.getNotifications(branchId, organisationId);
  }

  @Query(() => [NotificationDto])
  async userNotifications(
    @Args('userId', { type: () => ID }) userId: string,
    @Args('includeRead', {
      type: () => Boolean,
      nullable: true,
      defaultValue: false,
    })
    includeRead?: boolean,
  ): Promise<NotificationDto[]> {
    return this.notificationService.getUserNotifications(userId, includeRead);
  }

  @Mutation(() => NotificationDto)
  async createNotification(
    @Args('input') input: CreateNotificationInput,
  ): Promise<NotificationDto> {
    return this.notificationService.createNotification(input);
  }

  @Mutation(() => NotificationDto)
  async markNotificationAsRead(
    @Args('notificationId', { type: () => ID }) notificationId: string,
  ): Promise<NotificationDto> {
    return this.notificationService.markNotificationAsRead(notificationId);
  }

  @Mutation(() => Boolean)
  async markAllNotificationsAsRead(
    @Args('userId', { type: () => ID }) userId: string,
  ): Promise<boolean> {
    return this.notificationService.markAllNotificationsAsRead(userId);
  }

  @Mutation(() => Boolean)
  async deleteNotification(
    @Args('notificationId', { type: () => ID }) notificationId: string,
  ): Promise<boolean> {
    return this.notificationService.deleteNotification(notificationId);
  }
}
