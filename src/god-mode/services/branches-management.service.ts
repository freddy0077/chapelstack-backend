import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface CreateBranchInput {
  organisationId: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  website?: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateBranchInput {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  website?: string;
  description?: string;
  isActive?: boolean;
}

@Injectable()
export class BranchesManagementService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all branches for an organization with pagination
   */
  async getBranches(organisationId: string, skip: number = 0, take: number = 10) {
    // Verify organization exists
    const organization = await this.prisma.organisation.findUnique({
      where: { id: organisationId },
    });

    if (!organization) {
      throw new NotFoundException(`Organization with ID ${organisationId} not found`);
    }

    const [branches, total] = await Promise.all([
      this.prisma.branch.findMany({
        where: { organisationId },
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.branch.count({
        where: { organisationId },
      }),
    ]);

    return {
      branches,
      total,
      skip,
      take,
    };
  }

  /**
   * Get branches by organisation (alias for getBranches)
   */
  async getBranchesByOrganisation(organisationId: string, skip: number = 0, take: number = 10) {
    return this.getBranches(organisationId, skip, take);
  }

  /**
   * Get branch by ID
   */
  async getBranchById(id: string) {
    const branch = await this.prisma.branch.findUnique({
      where: { id },
      include: {
        organisation: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            members: true,
          },
        },
      },
    });

    if (!branch) {
      throw new NotFoundException(`Branch with ID ${id} not found`);
    }

    return branch;
  }

  /**
   * Search branches by name, email, or city
   */
  async searchBranches(
    organisationId: string,
    query: string,
    skip: number = 0,
    take: number = 10,
  ) {
    // Verify organization exists
    const organization = await this.prisma.organisation.findUnique({
      where: { id: organisationId },
    });

    if (!organization) {
      throw new NotFoundException(`Organization with ID ${organisationId} not found`);
    }

    const [branches, total] = await Promise.all([
      this.prisma.branch.findMany({
        where: {
          organisationId,
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
            { city: { contains: query, mode: 'insensitive' } },
            { address: { contains: query, mode: 'insensitive' } },
          ],
        },
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.branch.count({
        where: {
          organisationId,
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
            { city: { contains: query, mode: 'insensitive' } },
            { address: { contains: query, mode: 'insensitive' } },
          ],
        },
      }),
    ]);

    return {
      branches,
      total,
      skip,
      take,
    };
  }

  /**
   * Create new branch
   */
  async createBranch(input: CreateBranchInput) {
    // Verify organization exists
    const organization = await this.prisma.organisation.findUnique({
      where: { id: input.organisationId },
    });

    if (!organization) {
      throw new NotFoundException(`Organization with ID ${input.organisationId} not found`);
    }

    // Check if branch with same name already exists in this organization
    const existingBranch = await this.prisma.branch.findFirst({
      where: {
        organisationId: input.organisationId,
        name: input.name,
      },
    });

    if (existingBranch) {
      throw new BadRequestException(
        `Branch with name "${input.name}" already exists in this organization`,
      );
    }

    const branch = await this.prisma.branch.create({
      data: {
        organisationId: input.organisationId,
        name: input.name,
        email: input.email,
        phoneNumber: input.phone,
        address: input.address,
        city: input.city,
        state: input.state,
        country: input.country,
        postalCode: input.postalCode,
        website: input.website,
        description: input.description,
        isActive: input.isActive ?? true,
      },
    });

    return branch;
  }

  /**
   * Update branch
   */
  async updateBranch(id: string, input: UpdateBranchInput) {
    // Verify branch exists
    const branch = await this.prisma.branch.findUnique({
      where: { id },
    });

    if (!branch) {
      throw new NotFoundException(`Branch with ID ${id} not found`);
    }

    // If updating name, check for duplicates in the same organization
    if (input.name && input.name !== branch.name) {
      const existingBranch = await this.prisma.branch.findFirst({
        where: {
          organisationId: branch.organisationId,
          name: input.name,
          id: { not: id },
        },
      });

      if (existingBranch) {
        throw new BadRequestException(
          `Branch with name "${input.name}" already exists in this organization`,
        );
      }
    }

    const updatedBranch = await this.prisma.branch.update({
      where: { id },
      data: {
        name: input.name,
        email: input.email,
        phoneNumber: input.phone,
        address: input.address,
        city: input.city,
        state: input.state,
        country: input.country,
        postalCode: input.postalCode,
        website: input.website,
        description: input.description,
        isActive: input.isActive,
      },
    });

    return updatedBranch;
  }

  /**
   * Delete branch
   */
  async deleteBranch(id: string) {
    // Verify branch exists
    const branch = await this.prisma.branch.findUnique({
      where: { id },
    });

    if (!branch) {
      throw new NotFoundException(`Branch with ID ${id} not found`);
    }

    // Check if branch has any users or members
    const [userCount, memberCount] = await Promise.all([
      this.prisma.userBranch.count({
        where: { branchId: id },
      }),
      this.prisma.member.count({
        where: { branchId: id },
      }),
    ]);

    if (userCount > 0 || memberCount > 0) {
      throw new BadRequestException(
        `Cannot delete branch with active users or members. Please reassign them first.`,
      );
    }

    await this.prisma.branch.delete({
      where: { id },
    });

    return {
      success: true,
      message: `Branch deleted successfully`,
    };
  }
}
