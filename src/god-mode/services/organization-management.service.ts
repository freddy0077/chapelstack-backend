import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface CreateOrganizationInput {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  website?: string;
  logo?: string;
  description?: string;
}

export interface UpdateOrganizationInput {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  website?: string;
  logo?: string;
  description?: string;
  status?: string;
}

@Injectable()
export class OrganizationManagementService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all organizations with pagination
   */
  async getOrganizations(skip: number = 0, take: number = 10) {
    const [organizations, total] = await Promise.all([
      this.prisma.organisation.findMany({
        skip,
        take,
        include: {
          branches: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              users: true,
              members: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.organisation.count(),
    ]);

    return {
      organizations,
      total,
      skip,
      take,
    };
  }

  /**
   * Get organization by ID
   */
  async getOrganizationById(id: string) {
    const organization = await this.prisma.organisation.findUnique({
      where: { id },
      include: {
        branches: true,
        users: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            users: true,
            members: true,
            branches: true,
          },
        },
      },
    });

    if (!organization) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }

    return organization;
  }

  /**
   * Create new organization
   */
  async createOrganization(input: CreateOrganizationInput) {
    const organization = await this.prisma.organisation.create({
      data: {
        name: input.name,
        email: input.email,
        phoneNumber: input.phone,
        address: input.address,
        city: input.city,
        state: input.state,
        country: input.country,
        website: input.website,
        logoUrl: input.logo,
        description: input.description,
        status: 'ACTIVE',
        primaryColor: '#3B82F6',
        secondaryColor: '#10B981',
      },
      include: {
        branches: true,
      },
    });

    return organization;
  }

  /**
   * Update organization
   */
  async updateOrganization(id: string, input: UpdateOrganizationInput) {
    const organization = await this.prisma.organisation.update({
      where: { id },
      data: {
        ...input,
        status: input.status ? (input.status.toUpperCase() as any) : undefined,
      },
      include: {
        branches: true,
      },
    });

    return organization;
  }

  /**
   * Delete organization
   */
  async deleteOrganization(id: string) {
    // Check if organization has active subscriptions
    const activeSubscriptions = await this.prisma.subscription.count({
      where: {
        organisationId: id,
        status: 'ACTIVE',
      },
    });

    if (activeSubscriptions > 0) {
      throw new BadRequestException(
        'Cannot delete organization with active subscriptions',
      );
    }

    await this.prisma.organisation.delete({
      where: { id },
    });

    return { success: true, message: 'Organization deleted successfully' };
  }

  /**
   * Get organization statistics
   */
  async getOrganizationStats(id: string) {
    const organization = await this.getOrganizationById(id);

    const [members, users, branches, transactions] = await Promise.all([
      this.prisma.member.count({
        where: {
          organisationId: id,
        },
      }),
      this.prisma.user.count({
        where: {
          organisationId: id,
        },
      }),
      this.prisma.branch.count({
        where: {
          organisationId: id,
        },
      }),
      this.prisma.transaction.count({
        where: {
          organisationId: id,
        },
      }),
    ]);

    return {
      organizationId: id,
      organizationName: organization.name,
      totalMembers: members,
      totalUsers: users,
      totalBranches: branches,
      totalTransactions: transactions,
    };
  }

  /**
   * Search organizations
   */
  async searchOrganizations(query: string, skip: number = 0, take: number = 10) {
    const organizations = await this.prisma.organisation.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { city: { contains: query, mode: 'insensitive' } },
        ],
      },
      skip,
      take,
      orderBy: {
        name: 'asc',
      },
    });

    const total = await this.prisma.organisation.count({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { city: { contains: query, mode: 'insensitive' } },
        ],
      },
    });

    return {
      organizations,
      total,
      skip,
      take,
    };
  }
}
