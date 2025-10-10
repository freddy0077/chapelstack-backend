import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OrganisationStatus, SubscriptionStatus } from '@prisma/client';

export interface OrganizationFilter {
  status?: OrganisationStatus;
  subscriptionStatus?: SubscriptionStatus;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface OrganizationWithSubscription {
  id: string;
  name: string;
  email: string;
  status: OrganisationStatus;
  suspensionReason?: string;
  suspendedAt?: Date;
  suspendedBy?: string;
  createdAt: Date;
  updatedAt: Date;
  subscription?: {
    id: string;
    status: string;
    planName: string;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    amount: number;
  };
  _count: {
    branches: number;
    users: number;
    members: number;
  };
}

@Injectable()
export class OrganizationManagementService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrganizations(
    filter: OrganizationFilter = {},
  ): Promise<OrganizationWithSubscription[]> {
    const {
      status,
      subscriptionStatus,
      search,
      limit = 50,
      offset = 0,
    } = filter;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (subscriptionStatus) {
      if (subscriptionStatus === 'PAST_DUE') {
        // Filter for organizations with expired/past due subscriptions
        where.subscriptionsAsCustomer = {
          some: {
            OR: [
              { status: 'PAST_DUE' },
              { status: 'CANCELLED' },
              {
                AND: [
                  { status: { in: ['ACTIVE', 'TRIALING'] } },
                  { currentPeriodEnd: { lt: new Date() } },
                ],
              },
            ],
          },
        };
      } else {
        // Filter for organizations with specific subscription status
        where.subscriptionsAsCustomer = {
          some: {
            status: subscriptionStatus,
          },
        };
      }
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const organizations = await this.prisma.organisation.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        suspensionReason: true,
        suspendedAt: true,
        suspendedBy: true,
        createdAt: true,
        updatedAt: true,
        users: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
          take: 1,
          orderBy: {
            createdAt: 'asc',
          },
        },
        subscriptionsAsCustomer: {
          select: {
            id: true,
            status: true,
            currentPeriodStart: true,
            currentPeriodEnd: true,
            plan: {
              select: {
                name: true,
                amount: true,
              },
            },
          },
          where: {
            status: {
              in: ['ACTIVE', 'PAST_DUE', 'TRIALING'],
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
        _count: {
          select: {
            branches: true,
            users: true,
            members: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    });

    return organizations.map((org) => ({
      ...org,
      email: org.email || '',
      suspensionReason: org.suspensionReason || undefined,
      suspendedAt: org.suspendedAt || undefined,
      suspendedBy: org.suspendedBy || undefined,
      mainUser: org.users?.[0]
        ? {
            id: org.users[0].id,
            email: org.users[0].email,
            firstName: org.users[0].firstName || undefined,
            lastName: org.users[0].lastName || undefined,
          }
        : undefined,
      subscription: org.subscriptionsAsCustomer?.[0]
        ? {
            id: org.subscriptionsAsCustomer[0].id,
            status: org.subscriptionsAsCustomer[0].status,
            planName: org.subscriptionsAsCustomer[0].plan?.name || 'Unknown',
            currentPeriodStart:
              org.subscriptionsAsCustomer[0].currentPeriodStart,
            currentPeriodEnd: org.subscriptionsAsCustomer[0].currentPeriodEnd,
            amount: org.subscriptionsAsCustomer[0].plan?.amount || 0,
          }
        : undefined,
    }));
  }

  async getOrganizationById(id: string): Promise<OrganizationWithSubscription> {
    const organization = await this.prisma.organisation.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        suspensionReason: true,
        suspendedAt: true,
        suspendedBy: true,
        createdAt: true,
        updatedAt: true,
        subscriptionsAsCustomer: {
          select: {
            id: true,
            status: true,
            currentPeriodStart: true,
            currentPeriodEnd: true,
            plan: {
              select: {
                name: true,
                amount: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
        _count: {
          select: {
            branches: true,
            users: true,
            members: true,
          },
        },
      },
    });

    if (!organization) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }

    return {
      ...organization,
      email: organization.email || '',
      suspensionReason: organization.suspensionReason || undefined,
      suspendedAt: organization.suspendedAt || undefined,
      suspendedBy: organization.suspendedBy || undefined,
      subscription: organization.subscriptionsAsCustomer?.[0]
        ? {
            id: organization.subscriptionsAsCustomer[0].id,
            status: organization.subscriptionsAsCustomer[0].status,
            planName:
              organization.subscriptionsAsCustomer[0].plan?.name || 'Unknown',
            currentPeriodStart:
              organization.subscriptionsAsCustomer[0].currentPeriodStart,
            currentPeriodEnd:
              organization.subscriptionsAsCustomer[0].currentPeriodEnd,
            amount: organization.subscriptionsAsCustomer[0].plan?.amount || 0,
          }
        : undefined,
    };
  }

  async enableOrganization(
    id: string,
    userId: string,
  ): Promise<OrganizationWithSubscription> {
    const organization = await this.prisma.organisation.findUnique({
      where: { id },
    });

    if (!organization) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }

    if (organization.status === OrganisationStatus.ACTIVE) {
      throw new BadRequestException('Organization is already active');
    }

    const updatedOrganization = await this.prisma.organisation.update({
      where: { id },
      data: {
        status: OrganisationStatus.ACTIVE,
        suspensionReason: null,
        suspendedAt: null,
        suspendedBy: null,
        updatedAt: new Date(),
      },
    });

    // Log the action
    await this.prisma.auditLog.create({
      data: {
        action: 'ENABLE_ORGANIZATION',
        description: `Organization ${id} enabled by user ${userId}`,
        entityType: 'Organisation',
        entityId: id,
        userId,
        metadata: {
          organizationId: id,
          previousStatus: organization.status,
          newStatus: 'ACTIVE',
          reason: 'Organization enabled',
        },
      },
    });

    return this.getOrganizationById(id);
  }

  async disableOrganization(
    id: string,
    userId: string,
    reason: string,
  ): Promise<OrganizationWithSubscription> {
    const organization = await this.prisma.organisation.findUnique({
      where: { id },
    });

    if (!organization) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }

    if (organization.status === OrganisationStatus.SUSPENDED) {
      throw new BadRequestException('Organization is already suspended');
    }

    const updatedOrganization = await this.prisma.organisation.update({
      where: { id },
      data: {
        status: OrganisationStatus.SUSPENDED,
        suspensionReason: reason,
        suspendedAt: new Date(),
        suspendedBy: userId,
        updatedAt: new Date(),
      },
    });

    // Log the action
    await this.prisma.auditLog.create({
      data: {
        action: 'DISABLE_ORGANIZATION',
        description: `Organization ${id} disabled by user ${userId}: ${reason}`,
        entityType: 'Organisation',
        entityId: id,
        userId,
        metadata: {
          organizationId: id,
          previousStatus: organization.status,
          newStatus: 'SUSPENDED',
          reason,
        },
      },
    });

    return this.getOrganizationById(id);
  }

  async getOrganizationStats(): Promise<{
    total: number;
    active: number;
    suspended: number;
    trial: number;
    cancelled: number;
    inactive: number;
  }> {
    const stats = await this.prisma.organisation.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
    });

    const result = {
      total: 0,
      active: 0,
      suspended: 0,
      trial: 0,
      cancelled: 0,
      inactive: 0,
    };

    stats.forEach((stat) => {
      result.total += stat._count.id;
      switch (stat.status) {
        case OrganisationStatus.ACTIVE:
          result.active = stat._count.id;
          break;
        case OrganisationStatus.SUSPENDED:
          result.suspended = stat._count.id;
          break;
        case OrganisationStatus.TRIAL:
          result.trial = stat._count.id;
          break;
        case OrganisationStatus.CANCELLED:
          result.cancelled = stat._count.id;
          break;
        case OrganisationStatus.INACTIVE:
          result.inactive = stat._count.id;
          break;
      }
    });

    return result;
  }

  async updateOrganizationStatus(
    id: string,
    status: OrganisationStatus,
    userId: string,
    reason?: string,
  ): Promise<OrganizationWithSubscription> {
    const organization = await this.prisma.organisation.findUnique({
      where: { id },
    });

    if (!organization) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }

    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    if (status === OrganisationStatus.SUSPENDED) {
      updateData.suspensionReason = reason;
      updateData.suspendedAt = new Date();
      updateData.suspendedBy = userId;
    } else {
      updateData.suspensionReason = null;
      updateData.suspendedAt = null;
      updateData.suspendedBy = null;
    }

    await this.prisma.organisation.update({
      where: { id },
      data: updateData,
    });

    // Log the action
    await this.prisma.auditLog.create({
      data: {
        action: 'UPDATE_ORGANIZATION_STATUS',
        description: `Organization ${id} status updated by user ${userId}: ${reason || 'Status change'}`,
        entityType: 'Organisation',
        entityId: id,
        userId,
        metadata: {
          organizationId: id,
          previousStatus: organization.status,
          newStatus: status,
          reason,
        },
      },
    });

    return this.getOrganizationById(id);
  }
}
