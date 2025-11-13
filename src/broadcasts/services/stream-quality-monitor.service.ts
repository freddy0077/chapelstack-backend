import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';

export interface QualityMetrics {
  bitrate: number; // kbps
  fps: number; // frames per second
  resolution: string; // e.g., "1920x1080"
  droppedFrames: number;
  bufferHealth: number; // percentage
  latency: number; // milliseconds
  jitter: number; // milliseconds
  packetLoss: number; // percentage
}

export interface QualityAlert {
  type: 'LOW_BITRATE' | 'LOW_FPS' | 'HIGH_LATENCY' | 'PACKET_LOSS' | 'BUFFER_ISSUES';
  severity: 'WARNING' | 'CRITICAL';
  message: string;
  metrics: Partial<QualityMetrics>;
  timestamp: Date;
}

@Injectable()
export class StreamQualityMonitorService {
  private readonly logger = new Logger(StreamQualityMonitorService.name);

  // Quality thresholds
  private readonly thresholds = {
    bitrate: {
      min: 2500, // kbps
      warning: 3000,
      optimal: 5000,
    },
    fps: {
      min: 24,
      warning: 28,
      optimal: 30,
    },
    latency: {
      max: 3000, // ms
      warning: 2000,
      optimal: 1000,
    },
    packetLoss: {
      max: 5, // percentage
      warning: 2,
      optimal: 0.5,
    },
    bufferHealth: {
      min: 50, // percentage
      warning: 70,
      optimal: 90,
    },
  };

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Monitor stream quality for all live broadcasts
   * Runs every minute
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async monitorStreamQuality() {
    try {
      const liveBroadcasts = await this.prisma.broadcast.findMany({
        where: { status: 'LIVE' },
        include: { platforms: true },
      });

      for (const broadcast of liveBroadcasts) {
        for (const platform of broadcast.platforms) {
          if (platform.status === 'LIVE') {
            await this.checkPlatformQuality(broadcast.id, platform.id);
          }
        }
      }
    } catch (error) {
      this.logger.error('Error in quality monitoring cron:', error);
    }
  }

  /**
   * Check quality metrics for a platform
   */
  async checkPlatformQuality(
    broadcastId: string,
    platformId: string,
  ): Promise<QualityAlert[]> {
    try {
      // Get current metrics (in production, this would come from streaming server)
      const metrics = await this.getCurrentMetrics(platformId);

      // Analyze metrics and generate alerts
      const alerts = this.analyzeMetrics(metrics);

      // Record metrics
      await this.recordQualityMetrics(platformId, metrics);

      // Handle alerts
      if (alerts.length > 0) {
        await this.handleQualityAlerts(broadcastId, platformId, alerts);
      }

      return alerts;
    } catch (error) {
      this.logger.error(
        `Error checking quality for platform ${platformId}: ${error.message}`,
      );
      return [];
    }
  }

  /**
   * Get current stream metrics
   * In production, this would integrate with streaming server APIs
   */
  private async getCurrentMetrics(platformId: string): Promise<QualityMetrics> {
    // TODO: Integrate with actual streaming server (e.g., Wowza, Nginx-RTMP, etc.)
    // For now, return simulated metrics

    const platform = await this.prisma.broadcastPlatform.findUnique({
      where: { id: platformId },
    });

    if (!platform) {
      throw new Error('Platform not found');
    }

    // Simulate metrics (replace with actual API calls)
    return {
      bitrate: 4500 + Math.random() * 1000,
      fps: 29 + Math.random() * 2,
      resolution: '1920x1080',
      droppedFrames: Math.floor(Math.random() * 10),
      bufferHealth: 85 + Math.random() * 15,
      latency: 1200 + Math.random() * 800,
      jitter: 20 + Math.random() * 30,
      packetLoss: Math.random() * 2,
    };
  }

  /**
   * Analyze metrics and generate alerts
   */
  private analyzeMetrics(metrics: QualityMetrics): QualityAlert[] {
    const alerts: QualityAlert[] = [];

    // Check bitrate
    if (metrics.bitrate < this.thresholds.bitrate.min) {
      alerts.push({
        type: 'LOW_BITRATE',
        severity: 'CRITICAL',
        message: `Bitrate critically low: ${metrics.bitrate.toFixed(0)} kbps`,
        metrics: { bitrate: metrics.bitrate },
        timestamp: new Date(),
      });
    } else if (metrics.bitrate < this.thresholds.bitrate.warning) {
      alerts.push({
        type: 'LOW_BITRATE',
        severity: 'WARNING',
        message: `Bitrate below optimal: ${metrics.bitrate.toFixed(0)} kbps`,
        metrics: { bitrate: metrics.bitrate },
        timestamp: new Date(),
      });
    }

    // Check FPS
    if (metrics.fps < this.thresholds.fps.min) {
      alerts.push({
        type: 'LOW_FPS',
        severity: 'CRITICAL',
        message: `Frame rate critically low: ${metrics.fps.toFixed(1)} fps`,
        metrics: { fps: metrics.fps },
        timestamp: new Date(),
      });
    } else if (metrics.fps < this.thresholds.fps.warning) {
      alerts.push({
        type: 'LOW_FPS',
        severity: 'WARNING',
        message: `Frame rate below optimal: ${metrics.fps.toFixed(1)} fps`,
        metrics: { fps: metrics.fps },
        timestamp: new Date(),
      });
    }

    // Check latency
    if (metrics.latency > this.thresholds.latency.max) {
      alerts.push({
        type: 'HIGH_LATENCY',
        severity: 'CRITICAL',
        message: `Latency critically high: ${metrics.latency.toFixed(0)} ms`,
        metrics: { latency: metrics.latency },
        timestamp: new Date(),
      });
    } else if (metrics.latency > this.thresholds.latency.warning) {
      alerts.push({
        type: 'HIGH_LATENCY',
        severity: 'WARNING',
        message: `Latency above optimal: ${metrics.latency.toFixed(0)} ms`,
        metrics: { latency: metrics.latency },
        timestamp: new Date(),
      });
    }

    // Check packet loss
    if (metrics.packetLoss > this.thresholds.packetLoss.max) {
      alerts.push({
        type: 'PACKET_LOSS',
        severity: 'CRITICAL',
        message: `Packet loss critically high: ${metrics.packetLoss.toFixed(2)}%`,
        metrics: { packetLoss: metrics.packetLoss },
        timestamp: new Date(),
      });
    } else if (metrics.packetLoss > this.thresholds.packetLoss.warning) {
      alerts.push({
        type: 'PACKET_LOSS',
        severity: 'WARNING',
        message: `Packet loss above optimal: ${metrics.packetLoss.toFixed(2)}%`,
        metrics: { packetLoss: metrics.packetLoss },
        timestamp: new Date(),
      });
    }

    // Check buffer health
    if (metrics.bufferHealth < this.thresholds.bufferHealth.min) {
      alerts.push({
        type: 'BUFFER_ISSUES',
        severity: 'CRITICAL',
        message: `Buffer health critically low: ${metrics.bufferHealth.toFixed(0)}%`,
        metrics: { bufferHealth: metrics.bufferHealth },
        timestamp: new Date(),
      });
    } else if (metrics.bufferHealth < this.thresholds.bufferHealth.warning) {
      alerts.push({
        type: 'BUFFER_ISSUES',
        severity: 'WARNING',
        message: `Buffer health below optimal: ${metrics.bufferHealth.toFixed(0)}%`,
        metrics: { bufferHealth: metrics.bufferHealth },
        timestamp: new Date(),
      });
    }

    return alerts;
  }

  /**
   * Record quality metrics for analytics
   */
  private async recordQualityMetrics(
    platformId: string,
    metrics: QualityMetrics,
  ): Promise<void> {
    try {
      // Get the broadcast platform to find the broadcast and platform
      const broadcastPlatform = await this.prisma.broadcastPlatform.findUnique({
        where: { id: platformId },
      });

      if (!broadcastPlatform) {
        return;
      }

      await this.prisma.broadcastAnalytics.create({
        data: {
          broadcastId: broadcastPlatform.broadcastId,
          platform: broadcastPlatform.platform,
          timestamp: new Date(),
          viewerCount: 0, // Will be updated separately
        },
      });
    } catch (error: any) {
      this.logger.warn(`Failed to record quality metrics: ${error.message}`);
    }
  }

  /**
   * Handle quality alerts
   */
  private async handleQualityAlerts(
    broadcastId: string,
    platformId: string,
    alerts: QualityAlert[],
  ): Promise<void> {
    const criticalAlerts = alerts.filter((a) => a.severity === 'CRITICAL');
    const warningAlerts = alerts.filter((a) => a.severity === 'WARNING');

    if (criticalAlerts.length > 0) {
      this.logger.error(
        `CRITICAL quality issues for platform ${platformId}:`,
        criticalAlerts.map((a) => a.message),
      );

      // Update platform with error
      await this.prisma.broadcastPlatform.update({
        where: { id: platformId },
        data: {
          error: `Quality issues: ${criticalAlerts.map((a) => a.message).join(', ')}`,
        },
      });

      // TODO: Send critical alerts
      // - Email notification
      // - SMS alert
      // - Push notification
    }

    if (warningAlerts.length > 0) {
      this.logger.warn(
        `Quality warnings for platform ${platformId}:`,
        warningAlerts.map((a) => a.message),
      );
    }
  }

  /**
   * Get quality metrics history
   */
  async getQualityHistory(
    platformId: string,
    hours: number = 24,
  ): Promise<any[]> {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    // Get the broadcast platform to find the broadcast and platform
    const broadcastPlatform = await this.prisma.broadcastPlatform.findUnique({
      where: { id: platformId },
    });

    if (!broadcastPlatform) {
      return [];
    }

    const analytics = await this.prisma.broadcastAnalytics.findMany({
      where: {
        broadcastId: broadcastPlatform.broadcastId,
        platform: broadcastPlatform.platform,
        timestamp: { gte: since },
      },
      orderBy: { timestamp: 'asc' },
    });

    return analytics.map((record) => ({
      timestamp: record.timestamp,
      viewerCount: record.viewerCount,
      platform: record.platform,
    }));
  }

  /**
   * Get quality score (0-100)
   */
  calculateQualityScore(metrics: QualityMetrics): number {
    let score = 100;

    // Deduct points for each metric below optimal
    if (metrics.bitrate < this.thresholds.bitrate.optimal) {
      score -= 20;
    }
    if (metrics.fps < this.thresholds.fps.optimal) {
      score -= 15;
    }
    if (metrics.latency > this.thresholds.latency.optimal) {
      score -= 20;
    }
    if (metrics.packetLoss > this.thresholds.packetLoss.optimal) {
      score -= 25;
    }
    if (metrics.bufferHealth < this.thresholds.bufferHealth.optimal) {
      score -= 20;
    }

    return Math.max(0, score);
  }

  /**
   * Get recommendations based on metrics
   */
  getRecommendations(metrics: QualityMetrics): string[] {
    const recommendations: string[] = [];

    if (metrics.bitrate < this.thresholds.bitrate.optimal) {
      recommendations.push(
        'Increase bitrate for better video quality. Check internet connection speed.',
      );
    }

    if (metrics.fps < this.thresholds.fps.optimal) {
      recommendations.push(
        'Reduce encoding complexity or lower resolution to improve frame rate.',
      );
    }

    if (metrics.latency > this.thresholds.latency.optimal) {
      recommendations.push(
        'High latency detected. Consider using a CDN or closer streaming server.',
      );
    }

    if (metrics.packetLoss > this.thresholds.packetLoss.optimal) {
      recommendations.push(
        'Packet loss detected. Check network stability and consider using wired connection.',
      );
    }

    if (metrics.bufferHealth < this.thresholds.bufferHealth.optimal) {
      recommendations.push(
        'Buffer health low. Reduce bitrate or check encoding settings.',
      );
    }

    if (recommendations.length === 0) {
      recommendations.push('Stream quality is optimal. No action needed.');
    }

    return recommendations;
  }
}
