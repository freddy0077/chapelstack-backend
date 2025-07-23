import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import { OrganisationStatus, SubscriptionStatus } from '@prisma/client';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    organisationId?: string;
    roles?: Array<{ name: string }>;
  };
}

@Injectable()
export class OrganizationStatusMiddleware implements NestMiddleware {
  constructor(private readonly prisma: PrismaService) {}

  async use(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    // Skip middleware for subscription manager routes
    if (
      req.path.startsWith('/api/subscription-manager') ||
      req.path.startsWith('/graphql') ||
      req.path.startsWith('/webhooks') ||
      req.path.startsWith('/auth')
    ) {
      return next();
    }

    // Skip if user is not authenticated
    if (!req.user) {
      return next();
    }

    // Skip if user is SUPER_ADMIN or SUBSCRIPTION_MANAGER
    const userRoles = req.user.roles?.map((role) => role.name) || [];
    if (
      userRoles.includes('SUPER_ADMIN') ||
      userRoles.includes('SUBSCRIPTION_MANAGER')
    ) {
      return next();
    }

    // Check organization status and subscription
    if (req.user.organisationId) {
      try {
        // Get organization with subscription details
        const organization = await this.prisma.organisation.findUnique({
          where: { id: req.user.organisationId },
          include: {
            subscriptions: {
              where: {
                status: {
                  in: [
                    SubscriptionStatus.ACTIVE,
                    SubscriptionStatus.TRIALING,
                    SubscriptionStatus.PAST_DUE,
                  ],
                },
              },
              include: {
                plan: true,
              },
              orderBy: {
                createdAt: 'desc',
              },
              take: 1,
            },
          },
        });

        if (!organization) {
          throw new ForbiddenException({
            message: 'Organization not found',
            reason: 'Your organization could not be found in the system',
            contactSupport: true,
            statusCode: 'ORG_NOT_FOUND',
          });
        }

        // Check organization status
        if (organization.status === OrganisationStatus.CANCELLED) {
          const subscription = organization.subscriptions[0];
          let subscriptionMessage =
            "Your organization's subscription has been cancelled.";

          if (subscription) {
            if (subscription.status === SubscriptionStatus.PAST_DUE) {
              subscriptionMessage =
                "Your organization's subscription is past due. Please update your payment method to restore access.";
            } else if (subscription.cancelledAt) {
              subscriptionMessage = `Your organization\'s subscription was cancelled on ${subscription.cancelledAt.toLocaleDateString()}. Please renew to restore access.`;
            }
          }

          throw new ForbiddenException({
            message: 'Organization access suspended',
            reason: subscriptionMessage,
            contactSupport: true,
            statusCode: 'ORG_SUBSCRIPTION_CANCELLED',
            subscriptionStatus: subscription?.status,
            planName: subscription?.plan?.name,
          });
        }

        if (organization.status === OrganisationStatus.SUSPENDED) {
          const subscription = organization.subscriptions[0];
          let suspensionReason =
            organization.suspensionReason ||
            'Organization access has been suspended';

          if (subscription?.status === SubscriptionStatus.PAST_DUE) {
            const now = new Date();
            const expiryDate =
              subscription.trialEnd || subscription.currentPeriodEnd;
            const daysOverdue = Math.ceil(
              (now.getTime() - expiryDate.getTime()) / (1000 * 60 * 60 * 24),
            );

            suspensionReason = `Your subscription expired ${daysOverdue} days ago. You have a grace period to update your payment method.`;
          }

          throw new ForbiddenException({
            message: 'Organization access suspended',
            reason: suspensionReason,
            contactSupport: true,
            statusCode: 'ORG_SUSPENDED',
            subscriptionStatus: subscription?.status,
            planName: subscription?.plan?.name,
            gracePeriod: subscription?.status === SubscriptionStatus.PAST_DUE,
          });
        }

        // Check for subscription expiry warnings
        const subscription = organization.subscriptions[0];
        if (
          subscription &&
          (subscription.status === SubscriptionStatus.ACTIVE ||
            subscription.status === SubscriptionStatus.TRIALING)
        ) {
          const now = new Date();
          const expiryDate =
            subscription.trialEnd || subscription.currentPeriodEnd;
          const daysUntilExpiry = Math.ceil(
            (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
          );

          // Add warning headers for upcoming expiry
          if (daysUntilExpiry <= 7 && daysUntilExpiry > 0) {
            res.setHeader('X-Subscription-Warning', 'EXPIRING_SOON');
            res.setHeader('X-Days-Until-Expiry', daysUntilExpiry.toString());
            res.setHeader('X-Plan-Name', subscription.plan?.name || 'Unknown');
          }

          // Add subscription info to request for potential feature limitations
          (req as any).organizationSubscription = {
            status: subscription.status,
            planName: subscription.plan?.name,
            daysUntilExpiry,
            isTrialing: subscription.status === SubscriptionStatus.TRIALING,
          };
        }

        // Allow trial organizations with limited access
        if (organization.status === OrganisationStatus.TRIAL) {
          // Add trial status to request for potential feature limitations
          (req as any).organizationStatus = 'TRIAL';

          const subscription = organization.subscriptions[0];
          if (subscription?.trialEnd) {
            const now = new Date();
            const daysUntilTrialEnd = Math.ceil(
              (subscription.trialEnd.getTime() - now.getTime()) /
                (1000 * 60 * 60 * 24),
            );

            res.setHeader('X-Trial-Warning', 'TRIAL_ACTIVE');
            res.setHeader(
              'X-Trial-Days-Remaining',
              Math.max(0, daysUntilTrialEnd).toString(),
            );
          }
        }

        // Check if organization has no active subscription
        if (
          !subscription &&
          organization.status === OrganisationStatus.ACTIVE
        ) {
          // Organization is active but has no subscription - this might be a setup issue
          res.setHeader('X-Subscription-Warning', 'NO_SUBSCRIPTION');
        }
      } catch (error) {
        if (error instanceof ForbiddenException) {
          throw error;
        }
        // Log error and continue - don't block access due to database issues
        console.error('Organization status check failed:', error);
      }
    }

    next();
  }
}

// Helper function to apply middleware to specific routes
export function createOrganizationStatusMiddleware() {
  return (req: Request, res: Response, next: NextFunction) => {
    const middleware = new OrganizationStatusMiddleware(
      // This will be injected by NestJS when used as a proper middleware
      null as any,
    );
    return middleware.use(req, res, next);
  };
}
