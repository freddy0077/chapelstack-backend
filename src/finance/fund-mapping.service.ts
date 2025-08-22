import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  ContributionTypeFundMappingFilterInput,
  CreateContributionTypeFundMappingInput,
  UpdateContributionTypeFundMappingInput,
} from './dto/fund-mapping-inputs.dto';
import {
  FundMappingConfiguration,
  ContributionTypeFundMapping,
  PaginatedContributionTypeFundMappings,
} from './entities/contribution-type-fund-mapping.entity';

@Injectable()
export class FundMappingService {
  constructor(private readonly prisma: PrismaService) {}

  async getFundMappingConfiguration(
    branchId: string,
    organisationId: string,
  ): Promise<FundMappingConfiguration> {
    // Get existing mappings
    const mappings = await this.prisma.contributionTypeFundMapping.findMany({
      where: {
        branchId,
        organisationId,
        isActive: true,
      },
      include: {
        contributionType: true,
        fund: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get available contribution types
    const availableContributionTypes =
      await this.prisma.contributionType.findMany({
        where: {
          branchId,
          organisationId,
          isActive: true,
        },
        orderBy: {
          name: 'asc',
        },
      });

    // Get available funds
    const availableFunds = await this.prisma.fund.findMany({
      where: {
        branchId,
        organisationId,
        isActive: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Get the latest update timestamp
    const latestMapping =
      await this.prisma.contributionTypeFundMapping.findFirst({
        where: {
          branchId,
          organisationId,
        },
        orderBy: {
          updatedAt: 'desc',
        },
      });

    return {
      branchId,
      organisationId,
      lastUpdated:
        latestMapping?.updatedAt?.toISOString() || new Date().toISOString(),
      mappings: mappings.map(this.mapToGraphQLMapping),
      availableContributionTypes: availableContributionTypes.map((ct) => ({
        id: ct.id,
        name: ct.name,
        description: ct.description || undefined,
        isActive: ct.isActive,
      })),
      availableFunds: availableFunds.map((fund) => ({
        id: fund.id,
        name: fund.name,
        description: fund.description || undefined,
        isActive: fund.isActive,
      })),
    };
  }

  async getContributionTypeFundMappings(
    filter: ContributionTypeFundMappingFilterInput,
  ): Promise<PaginatedContributionTypeFundMappings> {
    const where: any = {};

    if (filter.branchId) where.branchId = filter.branchId;
    if (filter.organisationId) where.organisationId = filter.organisationId;
    if (filter.contributionTypeId)
      where.contributionTypeId = filter.contributionTypeId;
    if (filter.fundId) where.fundId = filter.fundId;
    if (filter.isActive !== undefined) where.isActive = filter.isActive;

    const [mappings, total] = await Promise.all([
      this.prisma.contributionTypeFundMapping.findMany({
        where,
        include: {
          contributionType: true,
          fund: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.contributionTypeFundMapping.count({ where }),
    ]);

    return {
      total,
      mappings: mappings.map(this.mapToGraphQLMapping),
    };
  }

  async createContributionTypeFundMapping(
    input: CreateContributionTypeFundMappingInput,
  ): Promise<ContributionTypeFundMapping> {
    const mapping = await this.prisma.contributionTypeFundMapping.create({
      data: {
        contributionTypeId: input.contributionTypeId,
        fundId: input.fundId,
        branchId: input.branchId,
        organisationId: input.organisationId,
        isActive: input.isActive ?? true,
      },
      include: {
        contributionType: true,
        fund: true,
      },
    });

    return this.mapToGraphQLMapping(mapping);
  }

  async updateContributionTypeFundMapping(
    input: UpdateContributionTypeFundMappingInput,
  ): Promise<ContributionTypeFundMapping> {
    const updateData: any = {};
    if (input.fundId !== undefined) updateData.fundId = input.fundId;
    if (input.isActive !== undefined) updateData.isActive = input.isActive;

    const mapping = await this.prisma.contributionTypeFundMapping.update({
      where: { id: input.id },
      data: updateData,
      include: {
        contributionType: true,
        fund: true,
      },
    });

    return this.mapToGraphQLMapping(mapping);
  }

  async deleteContributionTypeFundMapping(
    id: string,
  ): Promise<ContributionTypeFundMapping> {
    const mapping = await this.prisma.contributionTypeFundMapping.delete({
      where: { id },
      include: {
        contributionType: true,
        fund: true,
      },
    });

    return this.mapToGraphQLMapping(mapping);
  }

  async createDefaultFundMappings(
    branchId: string,
    organisationId: string,
  ): Promise<ContributionTypeFundMapping[]> {
    // Get all contribution types and funds for this branch/organization
    const [contributionTypes, funds] = await Promise.all([
      this.prisma.contributionType.findMany({
        where: { branchId, organisationId, isActive: true },
      }),
      this.prisma.fund.findMany({
        where: { branchId, organisationId, isActive: true },
      }),
    ]);

    if (contributionTypes.length === 0 || funds.length === 0) {
      throw new Error(
        'No contribution types or funds available to create default mappings',
      );
    }

    // Create default mappings - map each contribution type to the first available fund
    const defaultFund = funds[0];
    const mappingsToCreate = contributionTypes.map((ct) => ({
      contributionTypeId: ct.id,
      fundId: defaultFund.id,
      branchId,
      organisationId,
      isActive: true,
    }));

    // Use createMany for bulk insert, then fetch the created records
    await this.prisma.contributionTypeFundMapping.createMany({
      data: mappingsToCreate,
      skipDuplicates: true, // Skip if mapping already exists
    });

    // Fetch the created mappings
    const createdMappings =
      await this.prisma.contributionTypeFundMapping.findMany({
        where: {
          branchId,
          organisationId,
          contributionTypeId: { in: contributionTypes.map((ct) => ct.id) },
        },
        include: {
          contributionType: true,
          fund: true,
        },
      });

    return createdMappings.map(this.mapToGraphQLMapping);
  }

  async getFundForContributionType(
    contributionTypeId: string,
    branchId: string,
    organisationId: string,
  ): Promise<string | null> {
    const mapping = await this.prisma.contributionTypeFundMapping.findFirst({
      where: {
        contributionTypeId,
        branchId,
        organisationId,
        isActive: true,
      },
    });

    return mapping?.fundId || null;
  }

  async getFundForContributionTypeName(
    contributionTypeName: string,
    branchId: string,
    organisationId: string,
  ): Promise<string | null> {
    const contributionType = await this.prisma.contributionType.findFirst({
      where: {
        name: contributionTypeName,
        branchId,
        organisationId,
        isActive: true,
      },
    });

    if (!contributionType) return null;

    return this.getFundForContributionType(
      contributionType.id,
      branchId,
      organisationId,
    );
  }

  private mapToGraphQLMapping(mapping: any): ContributionTypeFundMapping {
    return {
      id: mapping.id,
      contributionTypeId: mapping.contributionTypeId,
      fundId: mapping.fundId,
      branchId: mapping.branchId,
      organisationId: mapping.organisationId,
      isActive: mapping.isActive,
      createdAt: mapping.createdAt.toISOString(),
      updatedAt: mapping.updatedAt.toISOString(),
      createdBy: mapping.createdBy,
      updatedBy: mapping.updatedBy,
      contributionType: mapping.contributionType
        ? {
            id: mapping.contributionType.id,
            name: mapping.contributionType.name,
            description: mapping.contributionType.description || undefined,
            isActive: mapping.contributionType.isActive,
          }
        : undefined,
      fund: mapping.fund
        ? {
            id: mapping.fund.id,
            name: mapping.fund.name,
            description: mapping.fund.description || undefined,
            isActive: mapping.fund.isActive,
          }
        : undefined,
    };
  }
}
