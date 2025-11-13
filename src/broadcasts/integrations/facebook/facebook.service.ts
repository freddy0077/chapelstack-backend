import { Injectable, HttpException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ApiClientBase } from '../base/api-client.base';

interface CreateLiveVideoOptions {
  title: string;
  description?: string;
}

interface FacebookLiveVideo {
  id: string;
  stream_url: string;
  secure_stream_url: string;
  stream_key: string;
  status: string;
}

@Injectable()
export class FacebookService extends ApiClientBase {
  protected readonly logger = new Logger(FacebookService.name);

  constructor(private readonly prisma: PrismaService) {
    super('Facebook', {
      baseURL: 'https://graph.facebook.com/v18.0',
      timeout: 30000,
      retry: {
        maxRetries: 3,
        retryDelay: 2000,
        exponentialBackoff: true,
      },
      circuitBreaker: {
        failureThreshold: 5,
        resetTimeout: 60000,
        enabled: true,
      },
    });
  }

  /**
   * Get access token with automatic refresh
   */
  private async getAccessToken(organisationId: string): Promise<string> {
    const credential = await this.prisma.platformCredential.findUnique({
      where: {
        organisationId_branchId_platform: {
          organisationId,
          branchId: null as any,
          platform: 'FACEBOOK',
        },
      },
    });

    if (!credential || !credential.isActive) {
      throw new HttpException(
        'Facebook account not connected. Please connect your Facebook account first.',
        400,
      );
    }

    // Check if token is expired or about to expire (within 1 hour)
    if (
      credential.tokenExpiresAt &&
      credential.tokenExpiresAt.getTime() - Date.now() < 3600000
    ) {
      this.logger.log('Facebook token expired or expiring soon, refreshing...');
      return await this.refreshAccessToken(organisationId, credential.id);
    }

    return credential.accessToken;
  }

  /**
   * Refresh Facebook access token
   */
  private async refreshAccessToken(
    organisationId: string,
    credentialId: string,
  ): Promise<string> {
    try {
      const credential = await this.prisma.platformCredential.findUnique({
        where: { id: credentialId },
      });

      if (!credential) {
        throw new HttpException('Credential not found', 404);
      }

      // Exchange short-lived token for long-lived token
      const response = await this.request<any>({
        method: 'GET',
        url: '/oauth/access_token',
        params: {
          grant_type: 'fb_exchange_token',
          client_id: process.env.FACEBOOK_APP_ID,
          client_secret: process.env.FACEBOOK_APP_SECRET,
          fb_exchange_token: credential.accessToken,
        },
      });

      // Update token in database
      const newExpiresAt = new Date(
        Date.now() + response.expires_in * 1000,
      );

      await this.prisma.platformCredential.update({
        where: { id: credentialId },
        data: {
          accessToken: response.access_token,
          tokenExpiresAt: newExpiresAt,
        },
      });

      this.logger.log('Facebook token refreshed successfully');
      return response.access_token;
    } catch (error: any) {
      this.logger.error('Failed to refresh Facebook token:', error);

      // Mark credential as inactive if refresh fails
      await this.prisma.platformCredential.update({
        where: { id: credentialId },
        data: { isActive: false },
      });

      throw new HttpException(
        'Failed to refresh Facebook token. Please reconnect your Facebook account.',
        401,
      );
    }
  }

  /**
   * Get Facebook Page ID for the organization
   */
  private async getPageId(organisationId: string): Promise<string> {
    const credential = await this.prisma.platformCredential.findUnique({
      where: {
        organisationId_branchId_platform: {
          organisationId,
          branchId: null as any,
          platform: 'FACEBOOK',
        },
      },
    });

    if (!credential?.platformUserId) {
      throw new HttpException('Facebook Page ID not found', 400);
    }

    return credential.platformUserId;
  }

  /**
   * Create a Facebook Live Video
   */
  async createLiveVideo(
    organisationId: string,
    options: CreateLiveVideoOptions,
  ): Promise<FacebookLiveVideo> {
    try {
      this.logger.log(`Creating Facebook Live video: ${options.title}`);

      const accessToken = await this.getAccessToken(organisationId);
      const pageId = await this.getPageId(organisationId);

      const response = await this.request<any>({
        method: 'POST',
        url: `/${pageId}/live_videos`,
        params: {
          access_token: accessToken,
        },
        data: {
          title: options.title,
          description: options.description || '',
          status: 'SCHEDULED_UNPUBLISHED',
        },
      });

      this.logger.log(`Facebook Live video created: ${response.id}`);

      return {
        id: response.id,
        stream_url: response.stream_url,
        secure_stream_url: response.secure_stream_url,
        stream_key: response.stream_url.split('/').pop() || '',
        status: response.status,
      };
    } catch (error: any) {
      this.logger.error('Failed to create Facebook Live video:', {
        error: error.message,
        response: error.response?.data,
      });

      throw new HttpException(
        error.response?.data?.error?.message ||
          'Failed to create Facebook Live video',
        error.response?.status || 500,
      );
    }
  }

  /**
   * Get Live Video details
   */
  async getLiveVideo(
    organisationId: string,
    videoId: string,
  ): Promise<FacebookLiveVideo | null> {
    try {
      const accessToken = await this.getAccessToken(organisationId);

      const response = await this.request<any>({
        method: 'GET',
        url: `/${videoId}`,
        params: {
          fields: 'id,stream_url,secure_stream_url,status,live_views',
          access_token: accessToken,
        },
      });

      return {
        id: response.id,
        stream_url: response.stream_url,
        secure_stream_url: response.secure_stream_url,
        stream_key: response.stream_url?.split('/').pop() || '',
        status: response.status,
      };
    } catch (error: any) {
      if (error.response?.status === 404) {
        this.logger.warn(`Facebook Live video not found: ${videoId}`);
        return null;
      }

      this.logger.error('Failed to get Facebook Live video:', {
        videoId,
        error: error.message,
      });

      throw new HttpException(
        'Failed to get Facebook Live video',
        error.response?.status || 500,
      );
    }
  }

  /**
   * Start Live Video (go live)
   */
  async startLiveVideo(videoId: string): Promise<void> {
    // Facebook Live videos start automatically when you begin streaming to the RTMP URL
    this.logger.log(`Facebook Live video ${videoId} ready. Start streaming to RTMP URL.`);
  }

  /**
   * End Live Video
   */
  async endLiveVideo(
    organisationId: string,
    videoId: string,
  ): Promise<void> {
    try {
      this.logger.log(`Ending Facebook Live video: ${videoId}`);

      const accessToken = await this.getAccessToken(organisationId);

      await this.request({
        method: 'POST',
        url: `/${videoId}`,
        params: {
          access_token: accessToken,
        },
        data: {
          end_live_video: true,
        },
      });

      this.logger.log(`Facebook Live video ended: ${videoId}`);
    } catch (error: any) {
      // Don't throw if video is already ended
      if (error.response?.status === 404 || error.response?.status === 400) {
        this.logger.warn(`Video ${videoId} may already be ended or not found`);
        return;
      }

      this.logger.error('Failed to end Facebook Live video:', {
        videoId,
        error: error.message,
      });
    }
  }

  /**
   * Get viewer count
   */
  async getViewerCount(
    organisationId: string,
    videoId: string,
  ): Promise<number> {
    try {
      const accessToken = await this.getAccessToken(organisationId);

      const response = await this.request<any>({
        method: 'GET',
        url: `/${videoId}`,
        params: {
          fields: 'live_views',
          access_token: accessToken,
        },
      });

      return response.live_views || 0;
    } catch (error: any) {
      this.logger.warn('Failed to get Facebook viewer count:', {
        videoId,
        error: error.message,
      });
      return 0;
    }
  }

  /**
   * Get user's Facebook Pages
   */
  async getUserPages(accessToken: string): Promise<any[]> {
    try {
      const response = await this.request<any>({
        method: 'GET',
        url: '/me/accounts',
        params: {
          access_token: accessToken,
        },
      });

      return response.data || [];
    } catch (error: any) {
      this.logger.error('Failed to get Facebook pages:', error);
      throw new HttpException(
        'Failed to get Facebook pages',
        error.response?.status || 500,
      );
    }
  }

  /**
   * Health check for Facebook API
   */
  async healthCheck(organisationId: string): Promise<boolean> {
    try {
      await this.getAccessToken(organisationId);
      return this.isHealthy();
    } catch (error) {
      return false;
    }
  }

  /**
   * Get service status
   */
  getStatus(): {
    healthy: boolean;
    circuitBreaker: any;
  } {
    return {
      healthy: this.isHealthy(),
      circuitBreaker: this.getCircuitBreakerStatus(),
    };
  }
}
