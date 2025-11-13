import { Args, ID, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AnnouncementService } from '../services/announcement.service';
import { AnnouncementNotificationService } from '../services/announcement-notification.service';
import { AnnouncementTemplateService } from '../services/announcement-template.service';
import { Announcement, AnnouncementsResponse } from '../entities/announcement.entity';
import { AnnouncementTemplate } from '../entities/announcement-template.entity';
import { DeliveryStatus } from '../entities/announcement-delivery.entity';
import { AnnouncementMetrics } from '../entities/announcement-metrics.entity';
import { CreateAnnouncementInput } from '../dto/create-announcement.input';
import { UpdateAnnouncementInput } from '../dto/update-announcement.input';
import { CreateAnnouncementTemplateInput } from '../dto/create-announcement-template.input';
import { AnnouncementFiltersInput } from '../dto/announcement-filters.input';

@Resolver(() => Announcement)
export class AnnouncementResolver {
  constructor(
    private readonly announcementService: AnnouncementService,
    private readonly announcementNotificationService: AnnouncementNotificationService,
    private readonly announcementTemplateService: AnnouncementTemplateService,
  ) {}

  // ============================================
  // QUERIES
  // ============================================

  /**
   * Get all announcements for a branch with filters
   */
  @Query(() => AnnouncementsResponse, { name: 'announcements' })
  async announcements(
    @Args('branchId', { type: () => ID }) branchId: string,
    @Args('filters', { type: () => AnnouncementFiltersInput, nullable: true })
    filters?: AnnouncementFiltersInput,
    @Args('limit', { type: () => Int, defaultValue: 50 }) limit?: number,
    @Args('offset', { type: () => Int, defaultValue: 0 }) offset?: number,
  ): Promise<AnnouncementsResponse> {
    return this.announcementService.findAll(
      branchId,
      filters,
      limit,
      offset,
    ) as any;
  }

  /**
   * Get a single announcement by ID
   */
  @Query(() => Announcement, { name: 'announcement' })
  async announcement(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Announcement> {
    return this.announcementService.findOne(id) as any;
  }

  /**
   * Get published announcements for notice board
   */
  @Query(() => AnnouncementsResponse, { name: 'publishedAnnouncements' })
  async publishedAnnouncements(
    @Args('branchId', { type: () => ID }) branchId: string,
    @Args('limit', { type: () => Int, defaultValue: 50 }) limit?: number,
    @Args('offset', { type: () => Int, defaultValue: 0 }) offset?: number,
  ): Promise<AnnouncementsResponse> {
    return this.announcementService.getPublished(branchId, limit, offset) as any;
  }

  /**
   * Get delivery status for an announcement
   */
  @Query(() => DeliveryStatus, { name: 'announcementDeliveryStatus' })
  async announcementDeliveryStatus(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<DeliveryStatus> {
    return this.announcementService.getDeliveryStatus(id) as any;
  }

  /**
   * Get engagement metrics for an announcement
   */
  @Query(() => AnnouncementMetrics, { name: 'announcementMetrics' })
  async announcementMetrics(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<AnnouncementMetrics> {
    return this.announcementService.getEngagementMetrics(id) as any;
  }

  /**
   * Get announcement templates
   */
  @Query(() => [AnnouncementTemplate], { name: 'announcementTemplates' })
  async announcementTemplates(
    @Args('branchId', { type: () => ID }) branchId: string,
  ): Promise<AnnouncementTemplate[]> {
    return this.announcementTemplateService.getTemplates(branchId) as any;
  }

  /**
   * Get a single announcement template
   */
  @Query(() => AnnouncementTemplate, { name: 'announcementTemplate' })
  async announcementTemplate(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<AnnouncementTemplate> {
    return this.announcementTemplateService.getTemplate(id) as any;
  }

  // ============================================
  // MUTATIONS
  // ============================================

  /**
   * Create a new announcement
   */
  @Mutation(() => Announcement)
  async createAnnouncement(
    @Args('input') input: CreateAnnouncementInput,
  ): Promise<Announcement> {
    return this.announcementService.create(
      input,
      'system-user',
      'system-branch',
    ) as any;
  }

  /**
   * Update an announcement
   */
  @Mutation(() => Announcement)
  async updateAnnouncement(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateAnnouncementInput,
  ): Promise<Announcement> {
    return this.announcementService.update(
      id,
      input,
      'system-user',
      'system-branch',
    ) as any;
  }

  /**
   * Delete an announcement
   */
  @Mutation(() => Boolean)
  async deleteAnnouncement(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    return this.announcementService.delete(
      id,
      'system-user',
      'system-branch',
    );
  }

  /**
   * Publish an announcement
   */
  @Mutation(() => Announcement)
  async publishAnnouncement(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Announcement> {
    const announcement = await this.announcementService.publish(
      id,
      'system-user',
      'system-branch',
    );

    this.announcementNotificationService
      .sendAnnouncementNotifications(id)
      .catch((error) => {
        console.error('Failed to send announcement notifications:', error);
      });

    return announcement as any;
  }

  /**
   * Schedule an announcement
   */
  @Mutation(() => Announcement)
  async scheduleAnnouncement(
    @Args('id', { type: () => ID }) id: string,
    @Args('scheduledFor') scheduledFor: Date,
  ): Promise<Announcement> {
    return this.announcementService.schedule(
      id,
      scheduledFor,
      'system-user',
      'system-branch',
    ) as any;
  }

  /**
   * Archive an announcement
   */
  @Mutation(() => Announcement)
  async archiveAnnouncement(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Announcement> {
    return this.announcementService.archive(
      id,
      'system-user',
      'system-branch',
    ) as any;
  }

  /**
   * Mark announcement as read
   */
  @Mutation(() => Boolean)
  async markAnnouncementAsRead(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    return this.announcementService.markAsRead(id, 'system-user');
  }

  /**
   * Create an announcement template
   */
  @Mutation(() => AnnouncementTemplate)
  async createAnnouncementTemplate(
    @Args('input') input: CreateAnnouncementTemplateInput,
  ): Promise<AnnouncementTemplate> {
    return this.announcementTemplateService.createTemplate(
      input,
      'system-user',
      'system-branch',
    ) as any;
  }

  /**
   * Delete an announcement template
   */
  @Mutation(() => Boolean)
  async deleteAnnouncementTemplate(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    return this.announcementTemplateService.deleteTemplate(
      id,
      'system-user',
      'system-branch',
    );
  }

  /**
   * Retry failed deliveries for an announcement
   */
  @Mutation(() => Boolean)
  async retryAnnouncementDeliveries(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    await this.announcementNotificationService.retryFailedDeliveries(id);
    return true;
  }

  /**
   * Track email open
   */
  @Mutation(() => Boolean)
  async trackAnnouncementEmailOpen(
    @Args('announcementId', { type: () => ID }) announcementId: string,
  ): Promise<boolean> {
    await this.announcementNotificationService.trackEmailOpen(
      announcementId,
      'system-user',
    );
    return true;
  }

  /**
   * Track link click
   */
  @Mutation(() => Boolean)
  async trackAnnouncementLinkClick(
    @Args('announcementId', { type: () => ID }) announcementId: string,
  ): Promise<boolean> {
    await this.announcementNotificationService.trackLinkClick(
      announcementId,
      'system-user',
    );
    return true;
  }
}
