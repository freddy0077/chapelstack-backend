import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBroadcastInput } from './dto/create-broadcast.input';
import { UpdateBroadcastInput } from './dto/update-broadcast.input';
import { BroadcastFilterInput } from './dto/broadcast-filter.input';
import { ZoomService } from './integrations/zoom/zoom.service';
import { FacebookService } from './integrations/facebook/facebook.service';
import { InstagramService } from './integrations/instagram/instagram.service';

@Injectable()
export class BroadcastsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly zoomService: ZoomService,
    private readonly facebookService: FacebookService,
    private readonly instagramService: InstagramService,
  ) {}

  /**
   * Create a new broadcast
   */
  async createBroadcast(
    input: CreateBroadcastInput,
    userId: string,
    organisationId: string,
  ) {
    const { platforms, branchId, ...broadcastData } = input;

    // Create the broadcast
    const broadcast = await this.prisma.broadcast.create({
      data: {
        ...broadcastData,
        scheduledStartTime: new Date(input.scheduledStartTime),
        scheduledEndTime: input.scheduledEndTime
          ? new Date(input.scheduledEndTime)
          : null,
        organisation: { connect: { id: organisationId } },
        ...(branchId
          ? { branch: { connect: { id: branchId } } }
          : {}),
        createdBy: { connect: { id: userId } },
        status: 'SCHEDULED',
      },
      include: {
        platforms: true,
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Create platform connections
    if (platforms && platforms.length > 0) {
      for (const platform of platforms) {
        await this.connectPlatform(broadcast.id, platform, organisationId);
      }
    }

    // Fetch and return the complete broadcast with platforms
    return this.getBroadcast(broadcast.id);
  }

  /**
   * Update an existing broadcast
   */
  async updateBroadcast(id: string, input: UpdateBroadcastInput) {
    const broadcast = await this.prisma.broadcast.findUnique({
      where: { id },
    });

    if (!broadcast) {
      throw new NotFoundException(`Broadcast with ID ${id} not found`);
    }

    // Don't allow updates to live broadcasts
    if (broadcast.status === 'LIVE') {
      throw new BadRequestException('Cannot update a live broadcast');
    }

    const updateData: any = { ...input };

    if (input.scheduledStartTime) {
      updateData.scheduledStartTime = new Date(input.scheduledStartTime);
    }

    if (input.scheduledEndTime) {
      updateData.scheduledEndTime = new Date(input.scheduledEndTime);
    }

    return this.prisma.broadcast.update({
      where: { id },
      data: updateData,
      include: {
        platforms: true,
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Delete a broadcast
   */
  async deleteBroadcast(id: string) {
    const broadcast = await this.prisma.broadcast.findUnique({
      where: { id },
      include: { platforms: true },
    });

    if (!broadcast) {
      throw new NotFoundException(`Broadcast with ID ${id} not found`);
    }

    // Don't allow deletion of live broadcasts
    if (broadcast.status === 'LIVE') {
      throw new BadRequestException('Cannot delete a live broadcast');
    }

    // Delete platform connections first (cascade should handle this, but being explicit)
    await this.prisma.broadcastPlatform.deleteMany({
      where: { broadcastId: id },
    });

    // Delete the broadcast
    return this.prisma.broadcast.delete({
      where: { id },
    });
  }

  /**
   * Get a single broadcast by ID
   */
  async getBroadcast(id: string) {
    const broadcast = await this.prisma.broadcast.findUnique({
      where: { id },
      include: {
        platforms: true,
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!broadcast) {
      throw new NotFoundException(`Broadcast with ID ${id} not found`);
    }

    return broadcast;
  }

  /**
   * List broadcasts with filters
   */
  async listBroadcasts(filter: BroadcastFilterInput) {
    const where: any = {};

    if (filter.organisationId) {
      where.organisationId = filter.organisationId;
    }

    if (filter.branchId) {
      where.branchId = filter.branchId;
    }

    if (filter.status) {
      where.status = filter.status;
    }

    if (filter.platform) {
      where.platforms = {
        some: {
          platform: filter.platform,
        },
      };
    }

    return this.prisma.broadcast.findMany({
      where,
      include: {
        platforms: true,
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        scheduledStartTime: 'desc',
      },
    });
  }

  /**
   * Get upcoming broadcasts
   */
  async getUpcomingBroadcasts(organisationId: string, branchId?: string) {
    const where: any = {
      organisationId,
      status: 'SCHEDULED',
      scheduledStartTime: {
        gte: new Date(),
      },
    };

    if (branchId) {
      where.branchId = branchId;
    }

    return this.prisma.broadcast.findMany({
      where,
      include: {
        platforms: true,
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        scheduledStartTime: 'asc',
      },
      take: 10,
    });
  }

  /**
   * Get live broadcasts
   */
  async getLiveBroadcasts(organisationId: string, branchId?: string) {
    const where: any = {
      organisationId,
      status: 'LIVE',
    };

    if (branchId) {
      where.branchId = branchId;
    }

    return this.prisma.broadcast.findMany({
      where,
      include: {
        platforms: true,
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        actualStartTime: 'desc',
      },
    });
  }

  /**
   * Start a broadcast
   */
  async startBroadcast(id: string) {
    const broadcast = await this.getBroadcast(id);

    if (broadcast.status !== 'SCHEDULED') {
      throw new BadRequestException(
        `Cannot start broadcast with status ${broadcast.status}`,
      );
    }

    // Start on each platform
    for (const platform of broadcast.platforms) {
      try {
        await this.startPlatformBroadcast(broadcast.id, platform.platform);
      } catch (error) {
        console.error(
          `Failed to start broadcast on ${platform.platform}:`,
          error,
        );
        // Update platform status to ERROR
        await this.prisma.broadcastPlatform.update({
          where: { id: platform.id },
          data: {
            status: 'ERROR',
            error: error.message,
          },
        });
      }
    }

    // Update broadcast status to LIVE
    return this.prisma.broadcast.update({
      where: { id },
      data: {
        status: 'LIVE',
        actualStartTime: new Date(),
      },
      include: {
        platforms: true,
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * End a broadcast
   */
  async endBroadcast(id: string) {
    const broadcast = await this.getBroadcast(id);

    if (broadcast.status !== 'LIVE') {
      throw new BadRequestException(
        `Cannot end broadcast with status ${broadcast.status}`,
      );
    }

    // End on each platform
    for (const platform of broadcast.platforms) {
      try {
        await this.endPlatformBroadcast(broadcast.id, platform.platform);
      } catch (error) {
        console.error(`Failed to end broadcast on ${platform.platform}:`, error);
      }
    }

    // Update broadcast status to ENDED
    return this.prisma.broadcast.update({
      where: { id },
      data: {
        status: 'ENDED',
        actualEndTime: new Date(),
      },
      include: {
        platforms: true,
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Cancel a broadcast
   */
  async cancelBroadcast(id: string) {
    const broadcast = await this.getBroadcast(id);

    if (broadcast.status === 'LIVE') {
      throw new BadRequestException('Cannot cancel a live broadcast. End it first.');
    }

    if (broadcast.status === 'ENDED') {
      throw new BadRequestException('Cannot cancel an ended broadcast');
    }

    return this.prisma.broadcast.update({
      where: { id },
      data: {
        status: 'CANCELLED',
      },
      include: {
        platforms: true,
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Connect a platform to a broadcast
   */
  async connectPlatform(
    broadcastId: string,
    platform: string,
    organisationId: string,
  ) {
    const broadcast = await this.getBroadcast(broadcastId);

    // Check if platform is already connected
    const existing = await this.prisma.broadcastPlatform.findUnique({
      where: {
        broadcastId_platform: {
          broadcastId,
          platform: platform as any,
        },
      },
    });

    if (existing) {
      throw new BadRequestException(
        `Platform ${platform} is already connected to this broadcast`,
      );
    }

    let platformId = '';
    let streamUrl = '';

    // Create platform-specific broadcast
    try {
      switch (platform) {
        case 'ZOOM':
          const zoomMeeting = await this.zoomService.createMeeting({
            topic: broadcast.title,
            startTime: broadcast.scheduledStartTime,
            duration: broadcast.scheduledEndTime
              ? Math.floor(
                  (new Date(broadcast.scheduledEndTime).getTime() -
                    new Date(broadcast.scheduledStartTime).getTime()) /
                    60000,
                )
              : 60,
          });
          platformId = zoomMeeting.id;
          streamUrl = zoomMeeting.join_url;

          // Update broadcast with Zoom details
          await this.prisma.broadcast.update({
            where: { id: broadcastId },
            data: {
              zoomMeetingId: zoomMeeting.id,
              zoomJoinUrl: zoomMeeting.join_url,
              zoomStartUrl: zoomMeeting.start_url,
            },
          });
          break;

        case 'FACEBOOK':
          const fbLive = await this.facebookService.createLiveVideo(
            organisationId,
            {
              title: broadcast.title,
              description: broadcast.description || undefined,
            },
          );
          platformId = fbLive.id;
          streamUrl = fbLive.stream_url;

          await this.prisma.broadcast.update({
            where: { id: broadcastId },
            data: {
              facebookLiveId: fbLive.id,
            },
          });
          break;

        case 'INSTAGRAM':
          const igLive = await this.instagramService.createLiveVideo(
            organisationId,
            {
              title: broadcast.title,
            },
          );
          platformId = igLive.id;
          streamUrl = igLive.stream_url;

          await this.prisma.broadcast.update({
            where: { id: broadcastId },
            data: {
              instagramLiveId: igLive.id,
            },
          });
          break;

        default:
          throw new BadRequestException(`Unsupported platform: ${platform}`);
      }

      // Create platform connection
      return this.prisma.broadcastPlatform.create({
        data: {
          broadcastId,
          platform: platform as any,
          platformId,
          streamUrl,
          status: 'CONNECTED',
        },
      });
    } catch (error) {
      console.error(`Failed to connect ${platform}:`, error);

      // Create platform connection with ERROR status
      return this.prisma.broadcastPlatform.create({
        data: {
          broadcastId,
          platform: platform as any,
          platformId: 'error',
          status: 'ERROR',
          error: error.message,
        },
      });
    }
  }

  /**
   * Disconnect a platform from a broadcast
   */
  async disconnectPlatform(broadcastId: string, platform: string) {
    const platformConnection = await this.prisma.broadcastPlatform.findUnique({
      where: {
        broadcastId_platform: {
          broadcastId,
          platform: platform as any,
        },
      },
    });

    if (!platformConnection) {
      throw new NotFoundException(
        `Platform ${platform} is not connected to this broadcast`,
      );
    }

    await this.prisma.broadcastPlatform.delete({
      where: { id: platformConnection.id },
    });

    return true;
  }

  /**
   * Start broadcast on a specific platform
   */
  private async startPlatformBroadcast(broadcastId: string, platform: string) {
    const platformConnection = await this.prisma.broadcastPlatform.findUnique({
      where: {
        broadcastId_platform: {
          broadcastId,
          platform: platform as any,
        },
      },
    });

    if (!platformConnection) {
      throw new NotFoundException(`Platform ${platform} not found`);
    }

    // Platform-specific start logic
    switch (platform) {
      case 'ZOOM':
        await this.zoomService.startMeeting(platformConnection.platformId);
        break;
      case 'FACEBOOK':
        await this.facebookService.startLiveVideo(platformConnection.platformId);
        break;
      case 'INSTAGRAM':
        await this.instagramService.startLiveVideo(platformConnection.platformId);
        break;
    }

    // Update platform status
    await this.prisma.broadcastPlatform.update({
      where: { id: platformConnection.id },
      data: { status: 'LIVE' },
    });
  }

  /**
   * End broadcast on a specific platform
   */
  private async endPlatformBroadcast(broadcastId: string, platform: string) {
    // Get broadcast details
    const broadcast = await this.prisma.broadcast.findUnique({
      where: { id: broadcastId },
    });

    if (!broadcast) {
      return;
    }

    const platformConnection = await this.prisma.broadcastPlatform.findUnique({
      where: {
        broadcastId_platform: {
          broadcastId,
          platform: platform as any,
        },
      },
    });

    if (!platformConnection) {
      return; // Already disconnected
    }

    // Platform-specific end logic
    switch (platform) {
      case 'ZOOM':
        await this.zoomService.endMeeting(platformConnection.platformId);
        break;
      case 'FACEBOOK':
        await this.facebookService.endLiveVideo(broadcast.organisationId, platformConnection.platformId);
        break;
      case 'INSTAGRAM':
        await this.instagramService.endLiveVideo(platformConnection.platformId);
        break;
    }

    // Update platform status
    await this.prisma.broadcastPlatform.update({
      where: { id: platformConnection.id },
      data: { status: 'ENDED' },
    });
  }

  /**
   * Update viewer count for a platform
   */
  async updateViewerCount(
    broadcastId: string,
    platform: string,
    count: number,
  ) {
    const platformConnection = await this.prisma.broadcastPlatform.findUnique({
      where: {
        broadcastId_platform: {
          broadcastId,
          platform: platform as any,
        },
      },
    });

    if (!platformConnection) {
      throw new NotFoundException(`Platform ${platform} not found`);
    }

    await this.prisma.broadcastPlatform.update({
      where: { id: platformConnection.id },
      data: { viewerCount: count },
    });

    // Update total viewer count on broadcast
    const allPlatforms = await this.prisma.broadcastPlatform.findMany({
      where: { broadcastId },
    });

    const totalViewers = allPlatforms.reduce(
      (sum, p) => sum + p.viewerCount,
      0,
    );

    const broadcast = await this.prisma.broadcast.findUnique({
      where: { id: broadcastId },
    });

    if (!broadcast) {
      throw new NotFoundException(`Broadcast with ID ${broadcastId} not found`);
    }

    const peakViewers = Math.max(broadcast.peakViewerCount, totalViewers);

    await this.prisma.broadcast.update({
      where: { id: broadcastId },
      data: {
        viewerCount: totalViewers,
        peakViewerCount: peakViewers,
      },
    });

    // Record analytics
    await this.prisma.broadcastAnalytics.create({
      data: {
        broadcastId,
        platform: platform as any,
        viewerCount: count,
        timestamp: new Date(),
      },
    });
  }

  /**
   * Get a broadcast platform by ID
   */
  async getBroadcastPlatform(platformId: string) {
    return this.prisma.broadcastPlatform.findUnique({
      where: { id: platformId },
    });
  }
}
