import { Injectable, HttpException, Logger } from '@nestjs/common';
import { ApiClientBase } from '../base/api-client.base';
import axios from 'axios';

interface CreateZoomMeetingOptions {
  topic: string;
  startTime: Date;
  duration: number; // in minutes
  timezone?: string;
}

interface ZoomMeeting {
  id: string;
  topic: string;
  start_time: string;
  duration: number;
  join_url: string;
  start_url: string;
  password?: string;
  status?: string;
}

interface ZoomTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

@Injectable()
export class ZoomService extends ApiClientBase {
  protected readonly logger = new Logger(ZoomService.name);
  private readonly clientId = process.env.ZOOM_CLIENT_ID;
  private readonly clientSecret = process.env.ZOOM_CLIENT_SECRET;
  private readonly accountId = process.env.ZOOM_ACCOUNT_ID;

  // Token caching
  private cachedToken: string | null = null;
  private tokenExpiresAt: number = 0;

  constructor() {
    super('Zoom', {
      baseURL: 'https://api.zoom.us/v2',
      timeout: 30000,
      retry: {
        maxRetries: 3,
        retryDelay: 2000,
        exponentialBackoff: true,
        retryableStatuses: [408, 429, 500, 502, 503, 504],
      },
      circuitBreaker: {
        failureThreshold: 5,
        resetTimeout: 60000,
        enabled: true,
      },
    });

    this.validateConfiguration();
  }

  /**
   * Validate required environment variables
   */
  private validateConfiguration(): void {
    const missing: string[] = [];

    if (!this.clientId) missing.push('ZOOM_CLIENT_ID');
    if (!this.clientSecret) missing.push('ZOOM_CLIENT_SECRET');
    if (!this.accountId) missing.push('ZOOM_ACCOUNT_ID');

    if (missing.length > 0) {
      this.logger.warn(
        `Missing Zoom configuration: ${missing.join(', ')}. Zoom integration will not work.`,
      );
    }
  }

  /**
   * Get OAuth access token with caching and refresh
   */
  private async getAccessToken(): Promise<string> {
    try {
      // Return cached token if still valid
      if (this.cachedToken && Date.now() < this.tokenExpiresAt) {
        this.logger.debug('Using cached Zoom access token');
        return this.cachedToken;
      }

      this.logger.log('Fetching new Zoom access token');

      const credentials = Buffer.from(
        `${this.clientId}:${this.clientSecret}`,
      ).toString('base64');

      const response = await axios.post<ZoomTokenResponse>(
        `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${this.accountId}`,
        {},
        {
          headers: {
            Authorization: `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          timeout: 10000,
        },
      );

      // Cache token with 5-minute buffer before expiry
      this.cachedToken = response.data.access_token;
      this.tokenExpiresAt = Date.now() + (response.data.expires_in - 300) * 1000;

      this.logger.log('Zoom access token obtained successfully');
      return this.cachedToken;
    } catch (error: any) {
      this.logger.error('Failed to get Zoom access token:', {
        error: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      // Clear cached token on error
      this.cachedToken = null;
      this.tokenExpiresAt = 0;

      throw new HttpException(
        'Failed to authenticate with Zoom. Please check your credentials.',
        error.response?.status || 500,
      );
    }
  }

  /**
   * Create a Zoom meeting with comprehensive error handling
   */
  async createMeeting(options: CreateZoomMeetingOptions): Promise<ZoomMeeting> {
    try {
      this.logger.log(`Creating Zoom meeting: ${options.topic}`);

      const accessToken = await this.getAccessToken();

      const meetingData = {
        topic: options.topic,
        type: 2, // Scheduled meeting
        start_time: options.startTime.toISOString(),
        duration: options.duration,
        timezone: options.timezone || 'UTC',
        settings: {
          host_video: true,
          participant_video: true,
          join_before_host: false,
          mute_upon_entry: true,
          watermark: false,
          use_pmi: false,
          approval_type: 0,
          audio: 'both',
          auto_recording: 'cloud',
          waiting_room: false,
          meeting_authentication: false,
        },
      };

      const response = await this.request<any>({
        method: 'POST',
        url: '/users/me/meetings',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        data: meetingData,
      });

      this.logger.log(`Zoom meeting created successfully: ${response.id}`);

      return {
        id: response.id.toString(),
        topic: response.topic,
        start_time: response.start_time,
        duration: response.duration,
        join_url: response.join_url,
        start_url: response.start_url,
        password: response.password,
        status: response.status,
      };
    } catch (error: any) {
      this.logger.error('Failed to create Zoom meeting:', {
        error: error.message,
        response: error.response?.data,
      });

      throw new HttpException(
        error.response?.data?.message || 'Failed to create Zoom meeting',
        error.response?.status || 500,
      );
    }
  }

  /**
   * Get meeting details with error handling
   */
  async getMeeting(
    organisationId: string,
    meetingId: string,
  ): Promise<ZoomMeeting | null> {
    try {
      this.logger.debug(`Getting Zoom meeting: ${meetingId}`);

      const accessToken = await this.getAccessToken();

      const response = await this.request<any>({
        method: 'GET',
        url: `/meetings/${meetingId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return {
        id: response.id.toString(),
        topic: response.topic,
        start_time: response.start_time,
        duration: response.duration,
        join_url: response.join_url,
        start_url: response.start_url,
        password: response.password,
        status: response.status,
      };
    } catch (error: any) {
      if (error.response?.status === 404) {
        this.logger.warn(`Zoom meeting not found: ${meetingId}`);
        return null;
      }

      this.logger.error('Failed to get Zoom meeting:', {
        meetingId,
        error: error.message,
      });

      throw new HttpException(
        'Failed to get Zoom meeting details',
        error.response?.status || 500,
      );
    }
  }

  /**
   * Start a meeting (Note: Zoom doesn't have an API to start meetings programmatically)
   * This is a placeholder - host must start manually via start_url
   */
  async startMeeting(meetingId: string): Promise<void> {
    // Zoom doesn't support programmatic meeting start
    // The host needs to use the start_url to begin the meeting
    console.log(`Meeting ${meetingId} ready to start. Host should use start_url.`);
  }

  /**
   * End a meeting with graceful error handling
   */
  async endMeeting(meetingId: string): Promise<void> {
    try {
      this.logger.log(`Ending Zoom meeting: ${meetingId}`);

      const accessToken = await this.getAccessToken();

      await this.request({
        method: 'PUT',
        url: `/meetings/${meetingId}/status`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        data: {
          action: 'end',
        },
      });

      this.logger.log(`Zoom meeting ended successfully: ${meetingId}`);
    } catch (error: any) {
      // Don't throw if meeting is already ended
      if (error.response?.status === 404 || error.response?.status === 400) {
        this.logger.warn(
          `Meeting ${meetingId} may already be ended or not found`,
        );
        return;
      }

      this.logger.error('Failed to end Zoom meeting:', {
        meetingId,
        error: error.message,
      });
    }
  }

  /**
   * Delete a meeting with error handling
   */
  async deleteMeeting(meetingId: string): Promise<void> {
    try {
      this.logger.log(`Deleting Zoom meeting: ${meetingId}`);

      const accessToken = await this.getAccessToken();

      await this.request({
        method: 'DELETE',
        url: `/meetings/${meetingId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      this.logger.log(`Zoom meeting deleted successfully: ${meetingId}`);
    } catch (error: any) {
      if (error.response?.status === 404) {
        this.logger.warn(`Meeting ${meetingId} not found, may already be deleted`);
        return;
      }

      this.logger.error('Failed to delete Zoom meeting:', {
        meetingId,
        error: error.message,
      });

      throw new HttpException(
        'Failed to delete Zoom meeting',
        error.response?.status || 500,
      );
    }
  }

  /**
   * Get meeting participants with error handling
   */
  async getMeetingParticipants(meetingId: string): Promise<number> {
    try {
      const accessToken = await this.getAccessToken();

      const response = await this.request<any>({
        method: 'GET',
        url: `/metrics/meetings/${meetingId}/participants`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.total_records || 0;
    } catch (error: any) {
      this.logger.warn('Failed to get Zoom participants:', {
        meetingId,
        error: error.message,
      });
      return 0;
    }
  }

  /**
   * Get meeting recordings with error handling
   */
  async getMeetingRecordings(meetingId: string): Promise<any[]> {
    try {
      const accessToken = await this.getAccessToken();

      const response = await this.request<any>({
        method: 'GET',
        url: `/meetings/${meetingId}/recordings`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.recording_files || [];
    } catch (error: any) {
      this.logger.warn('Failed to get Zoom recordings:', {
        meetingId,
        error: error.message,
      });
      return [];
    }
  }

  /**
   * Health check for Zoom API
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.getAccessToken();
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
    tokenCached: boolean;
  } {
    return {
      healthy: this.isHealthy(),
      circuitBreaker: this.getCircuitBreakerStatus(),
      tokenCached: this.cachedToken !== null,
    };
  }
}
