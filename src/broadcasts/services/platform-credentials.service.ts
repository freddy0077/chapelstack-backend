import { Injectable, HttpException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConnectPlatformInput } from '../dto/connect-platform.input';

@Injectable()
export class PlatformCredentialsService {
  private readonly logger = new Logger(PlatformCredentialsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Connect a platform for an organization
   */
  async connectPlatform(
    organisationId: string,
    input: ConnectPlatformInput,
  ) {
    try {
      this.logger.log(`Connecting ${input.platform} for organization ${organisationId}`);

      // Check if platform is already connected
      const existing = await this.prisma.platformCredential.findUnique({
        where: {
          organisationId_branchId_platform: {
            organisationId,
            branchId: null as any,
            platform: input.platform as any,
          },
        },
      });

      if (existing) {
        // Update existing credential
        return await this.prisma.platformCredential.update({
          where: { id: existing.id },
          data: {
            accessToken: input.accessToken,
            refreshToken: input.refreshToken,
            platformUserId: input.platformUserId,
            platformUsername: input.platformUserName,
            tokenExpiresAt: input.tokenExpiresAt,
            isActive: true,
          },
        });
      }

      // Create new credential
      return await this.prisma.platformCredential.create({
        data: {
          organisationId,
          branchId: null,
          platform: input.platform as any,
          accessToken: input.accessToken,
          refreshToken: input.refreshToken,
          platformUserId: input.platformUserId,
          platformUsername: input.platformUserName,
          tokenExpiresAt: input.tokenExpiresAt,
          isActive: true,
        },
      });
    } catch (error: any) {
      this.logger.error('Failed to connect platform:', error);
      throw new HttpException(
        `Failed to connect ${input.platform}`,
        500,
      );
    }
  }

  /**
   * Disconnect a platform
   */
  async disconnectPlatform(
    organisationId: string,
    platform: string,
  ) {
    try {
      this.logger.log(`Disconnecting ${platform} for organization ${organisationId}`);

      const credential = await this.prisma.platformCredential.findUnique({
        where: {
          organisationId_branchId_platform: {
            organisationId,
            branchId: null as any,
            platform: platform as any,
          },
        },
      });

      if (!credential) {
        throw new HttpException('Platform not connected', 404);
      }

      // Soft delete by marking as inactive
      await this.prisma.platformCredential.update({
        where: { id: credential.id },
        data: { isActive: false },
      });

      return true;
    } catch (error: any) {
      this.logger.error('Failed to disconnect platform:', error);
      throw new HttpException(
        `Failed to disconnect ${platform}`,
        500,
      );
    }
  }

  /**
   * Get connected platforms for an organization
   */
  async getConnectedPlatforms(organisationId: string) {
    const credentials = await this.prisma.platformCredential.findMany({
      where: {
        organisationId,
        branchId: null,
        isActive: true,
      },
      select: {
        id: true,
        platform: true,
        platformUserId: true,
        platformUsername: true,
        tokenExpiresAt: true,
        isActive: true,
        createdAt: true,
      },
    });

    return credentials.map((cred) => ({
      ...cred,
      platformUserName: cred.platformUsername,
      isExpired: cred.tokenExpiresAt
        ? cred.tokenExpiresAt < new Date()
        : false,
    }));
  }

  /**
   * Check if a platform is connected
   */
  async isPlatformConnected(
    organisationId: string,
    platform: string,
  ): Promise<boolean> {
    const credential = await this.prisma.platformCredential.findUnique({
      where: {
        organisationId_branchId_platform: {
          organisationId,
          branchId: null as any,
          platform: platform as any,
        },
      },
    });

    return credential !== null && credential.isActive;
  }

  /**
   * Get platform connection status
   */
  async getPlatformStatus(
    organisationId: string,
    platform: string,
  ) {
    const credential = await this.prisma.platformCredential.findUnique({
      where: {
        organisationId_branchId_platform: {
          organisationId,
          branchId: null as any,
          platform: platform as any,
        },
      },
    });

    if (!credential) {
      return {
        connected: false,
        platform,
        status: 'NOT_CONNECTED',
      };
    }

    const isExpired = credential.tokenExpiresAt
      ? credential.tokenExpiresAt < new Date()
      : false;

    return {
      connected: credential.isActive && !isExpired,
      platform,
      platformUserId: credential.platformUserId,
      platformUserName: credential.platformUsername,
      tokenExpiresAt: credential.tokenExpiresAt,
      isExpired,
      status: credential.isActive
        ? isExpired
          ? 'EXPIRED'
          : 'CONNECTED'
        : 'DISCONNECTED',
    };
  }
}
