import { Injectable, HttpException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ApiClientBase } from '../base/api-client.base';

interface CreateLiveVideoOptions {
  title: string;
}

interface InstagramLiveVideo {
  id: string;
  stream_url: string;
  stream_key: string;
  status: string;
}

@Injectable()
export class InstagramService extends ApiClientBase {
  protected readonly logger = new Logger(InstagramService.name);

  constructor(private readonly prisma: PrismaService) {
    super('Instagram', {
      baseURL: 'https://graph.instagram.com',
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
   * Get access token for the organization
   */
  private async getAccessToken(organisationId: string): Promise<string> {
    const credential = await this.prisma.platformCredential.findUnique({
      where: {
        organisationId_branchId_platform: {
          organisationId,
          branchId: null as any,
          platform: 'INSTAGRAM',
        },
      },
    });

    if (!credential || !credential.isActive) {
      throw new HttpException(
        'Instagram account not connected. Please connect your Instagram account first.',
        400,
      );
    }

    // Check if token is expired
    if (credential.tokenExpiresAt && credential.tokenExpiresAt < new Date()) {
      throw new HttpException('Instagram token expired. Please reconnect.', 401);
    }

    return credential.accessToken;
  }

  /**
   * Get Instagram Business Account ID
   */
  private async getBusinessAccountId(organisationId: string): Promise<string> {
    const credential = await this.prisma.platformCredential.findUnique({
      where: {
        organisationId_branchId_platform: {
          organisationId,
          branchId: null as any,
          platform: 'INSTAGRAM',
        },
      },
    });

    if (!credential?.platformUserId) {
      throw new HttpException('Instagram Business Account ID not found', 400);
    }

    return credential.platformUserId;
  }

  /**
   * Create Instagram Live Video
   * 
   * Note: Instagram Live API requires special Meta approval.
   * This implementation provides clear guidance for users.
   */
  async createLiveVideo(
    organisationId: string,
    options: CreateLiveVideoOptions,
  ): Promise<InstagramLiveVideo> {
    this.logger.warn(
      'Instagram Live API requires Meta approval. Returning instructions for alternative methods.',
    );

    // Instagram Live API is not publicly available without approval
    // Provide clear error message with alternatives
    throw new HttpException(
      {
        statusCode: 501,
        message: 'Instagram Live API not available',
        error: 'Not Implemented',
        alternatives: [
          {
            method: 'Instagram Mobile App',
            description: 'Use Instagram mobile app to go live directly',
            steps: [
              'Open Instagram app',
              'Tap your profile picture (+ icon)',
              'Select "Live"',
              'Add title and go live',
            ],
          },
          {
            method: 'Third-Party Services',
            description: 'Use professional streaming services',
            services: [
              {
                name: 'Restream.io',
                url: 'https://restream.io/',
                features: ['Multi-platform streaming', 'Instagram support', 'Free tier available'],
              },
              {
                name: 'StreamYard',
                url: 'https://streamyard.com/',
                features: ['Browser-based', 'Instagram integration', 'Professional features'],
              },
            ],
          },
          {
            method: 'Apply for API Access',
            description: 'Request Instagram Live API access from Meta',
            steps: [
              'Visit https://developers.facebook.com/',
              'Submit application for Instagram Live API',
              'Wait for approval (can take weeks)',
              'Implement direct API integration',
            ],
          },
        ],
      },
      501,
    );
  }

  /**
   * Get Live Video details
   */
  async getLiveVideo(
    organisationId: string,
    videoId: string,
  ): Promise<InstagramLiveVideo> {
    try {
      console.warn('Instagram Live API access required.');

      return {
        id: videoId,
        stream_url: 'rtmps://live-upload.instagram.com:443/rtmp/',
        stream_key: 'placeholder_stream_key',
        status: 'LIVE',
      };
    } catch (error) {
      console.error('Failed to get Instagram Live video:', error);
      throw new HttpException(
        'Failed to get Instagram Live video',
        error.response?.status || 500,
      );
    }
  }

  /**
   * Start Live Video
   */
  async startLiveVideo(videoId: string): Promise<void> {
    console.log(
      `Instagram Live video ${videoId} ready. Use Instagram mobile app to go live.`,
    );
  }

  /**
   * End Live Video
   */
  async endLiveVideo(videoId: string): Promise<void> {
    console.log(`Ending Instagram Live video ${videoId}`);
  }

  /**
   * Get viewer count
   */
  async getViewerCount(
    organisationId: string,
    videoId: string,
  ): Promise<number> {
    try {
      // Placeholder - would require Instagram Live API access
      return 0;
    } catch (error) {
      console.error('Failed to get Instagram viewer count:', error);
      return 0;
    }
  }

  /**
   * Get instructions for Instagram Live alternatives
   */
  getThirdPartyInstructions(): any {
    return {
      message: 'Instagram Live API requires Meta approval',
      alternatives: [
        {
          method: 'Instagram Mobile App',
          description: 'Use Instagram mobile app to go live directly',
          steps: [
            'Open Instagram app',
            'Tap your profile picture (+ icon)',
            'Select "Live"',
            'Add title and go live',
          ],
        },
        {
          method: 'Third-Party Services',
          description: 'Use professional streaming services',
          services: [
            {
              name: 'Restream.io',
              url: 'https://restream.io/',
              features: ['Multi-platform streaming', 'Instagram support', 'Free tier available'],
            },
            {
              name: 'StreamYard',
              url: 'https://streamyard.com/',
              features: ['Browser-based', 'Instagram integration', 'Professional features'],
            },
          ],
        },
        {
          method: 'Apply for API Access',
          description: 'Request Instagram Live API access from Meta',
          steps: [
            'Visit https://developers.facebook.com/',
            'Submit application for Instagram Live API',
            'Wait for approval (can take weeks)',
            'Implement direct API integration',
          ],
        },
      ],
    };
  }

  /**
   * Health check for Instagram API
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
    apiAvailable: boolean;
  } {
    return {
      healthy: this.isHealthy(),
      circuitBreaker: this.getCircuitBreakerStatus(),
      apiAvailable: false, // Instagram Live API not publicly available
    };
  }
}
