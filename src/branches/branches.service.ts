import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Corrected path to src/prisma
import { CreateBranchInput } from './dto/create-branch.input';
import { UpdateBranchInput } from './dto/update-branch.input';
import { BranchFilterInput } from './dto/branch-filter.input';
import { PaginationInput } from '../common/dto/pagination.input';
import { UpdateBranchSettingInput } from './dto/update-branch-setting.input';
import { Prisma, Branch as PrismaBranch } from '@prisma/client'; // Using standard @prisma/client
import { Branch } from './entities/branch.entity'; // For GQL type
import { AuditLogService } from '../audit/services/audit-log.service';

// Helper function to map Prisma Branch to GraphQL Branch
function toGraphQLBranch(
  prismaBranch: PrismaBranch & { settings?: any[] },
): Branch {
  const branch: Branch = {
    id: prismaBranch.id,
    name: prismaBranch.name,
    isActive: prismaBranch.isActive,
    createdAt: prismaBranch.createdAt,
    updatedAt: prismaBranch.updatedAt,
  };

  if (prismaBranch.address != null) branch.address = prismaBranch.address;
  if (prismaBranch.city != null) branch.city = prismaBranch.city;
  if (prismaBranch.state != null) branch.state = prismaBranch.state;
  if (prismaBranch.postalCode != null) branch.postalCode = prismaBranch.postalCode;
  if (prismaBranch.country != null) branch.country = prismaBranch.country;
  if (prismaBranch.phoneNumber != null) branch.phoneNumber = prismaBranch.phoneNumber;
  if (prismaBranch.email != null) branch.email = prismaBranch.email;
  if (prismaBranch.website != null) branch.website = prismaBranch.website;
  if (prismaBranch.description != null) branch.description = prismaBranch.description;
  if (prismaBranch.logoUrl != null) branch.logoUrl = prismaBranch.logoUrl;
  if (prismaBranch.establishedAt != null) branch.establishedAt = prismaBranch.establishedAt;
  if (prismaBranch.emailDisplayName != null)
    branch.emailDisplayName = prismaBranch.emailDisplayName;
  if (prismaBranch.emailSignature != null)
    branch.emailSignature = prismaBranch.emailSignature;
  if (prismaBranch.smsDisplayName != null)
    branch.smsDisplayName = prismaBranch.smsDisplayName;
  if (prismaBranch.settings != null) branch.settings = prismaBranch.settings as any;
  if (prismaBranch.organisationId != null)
    branch.organisationId = prismaBranch.organisationId;

  return branch;
}

@Injectable()
export class BranchesService {
  /**
   * Returns the total number of branches.
   */
  async countAll(): Promise<number> {
    return this.prisma.branch.count();
  }

  /**
   * Returns the number of active branches.
   */
  async countActive(): Promise<number> {
    return this.prisma.branch.count({ where: { isActive: true } });
  }

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async create(createBranchInput: CreateBranchInput) {
    if (createBranchInput.email) {
      const existingBranchByEmail = await this.prisma.branch.findUnique({
        where: { email: createBranchInput.email },
      });
      if (existingBranchByEmail) {
        throw new ConflictException(
          `Branch with email ${createBranchInput.email} already exists.`,
        );
      }
    }

    const newBranch = await this.prisma.branch.create({
      data: {
        name: createBranchInput.name,
        address: createBranchInput.address,
        city: createBranchInput.city,
        state: createBranchInput.state,
        postalCode: createBranchInput.postalCode,
        country: createBranchInput.country,
        phoneNumber: createBranchInput.phoneNumber,
        email: createBranchInput.email,
        website: createBranchInput.website,
        establishedAt: createBranchInput.establishedAt,
        isActive: createBranchInput.isActive,
        organisationId: createBranchInput.organisationId,
      },
    });

    // Log the branch creation - logs are scoped to this branch
    await this.auditLogService.create({
      action: 'CREATE_BRANCH',
      entityType: 'Branch',
      entityId: newBranch.id,
      description: `Branch created: ${newBranch.name}`,
      branchId: newBranch.id, // Branch-scoped: log belongs to this branch
      metadata: {
        name: newBranch.name,
        email: newBranch.email,
        city: newBranch.city,
        organisationId: newBranch.organisationId,
      },
    });

    return this.mapPrismaBranchToEntity(newBranch);
  }

  async findAll(
    paginationInput: PaginationInput,
    filterInput?: BranchFilterInput,
  ) {
    const { skip = 0, take = 10 } = paginationInput; // Ensure defaults if not in object
    const where: Prisma.BranchWhereInput = {};

    if (filterInput) {
      if (filterInput.id) {
        where.id = filterInput.id;
      }
      if (filterInput.nameContains) {
        where.name = {
          contains: filterInput.nameContains,
          mode: 'insensitive',
        };
      }
      if (filterInput.cityContains) {
        where.city = {
          contains: filterInput.cityContains,
          mode: 'insensitive',
        };
      }
      if (filterInput.stateContains) {
        where.state = {
          contains: filterInput.stateContains,
          mode: 'insensitive',
        };
      }
      if (filterInput.countryContains) {
        where.country = {
          contains: filterInput.countryContains,
          mode: 'insensitive',
        };
      }
      if (filterInput.isActive !== undefined) {
        where.isActive = filterInput.isActive;
      }
      if (filterInput.emailContains) {
        where.email = {
          contains: filterInput.emailContains,
          mode: 'insensitive',
        };
      }
      if (filterInput.organisationId) {
        where.organisationId = filterInput.organisationId;
      }
    }

    const [prismaBranches, totalCount] = await this.prisma.$transaction([
      this.prisma.branch.findMany({
        skip,
        take,
        where,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.branch.count({ where }),
    ]);

    return {
      items: prismaBranches.map(this.mapPrismaBranchToEntity),
      totalCount,
      hasNextPage: skip + take < totalCount,
    };
  }

  async findOne(id: string) {
    const branch = await this.prisma.branch.findUnique({
      where: { id },
      include: {
        settings: true,
      },
    });

    if (!branch) {
      throw new NotFoundException(`Branch with ID ${id} not found`);
    }

    return this.mapPrismaBranchToEntity(branch);
  }

  async update(id: string, updateBranchInput: UpdateBranchInput) {
    await this.findOne(id); // Ensure branch exists

    if (updateBranchInput.email) {
      const existingBranchByEmail = await this.prisma.branch.findFirst({
        where: {
          email: updateBranchInput.email,
          id: { not: id },
        },
      });
      if (existingBranchByEmail) {
        throw new ConflictException(
          `Another branch with email ${updateBranchInput.email} already exists.`,
        );
      }
    }

    // Filter out empty strings to avoid unique constraint violations
    // Convert empty strings to null for fields that should be cleared
    const updateData = Object.fromEntries(
      Object.entries(updateBranchInput).map(([key, value]) => [
        key,
        value === '' ? null : value,
      ])
    );

    const updatedBranch = await this.prisma.branch.update({
      where: { id },
      data: updateData,
    });

    // Log the branch update - scoped to this branch
    await this.auditLogService.create({
      action: 'UPDATE_BRANCH',
      entityType: 'Branch',
      entityId: id,
      description: `Branch updated: ${updatedBranch.name}`,
      branchId: id, // Branch-scoped: log belongs to this branch
      metadata: {
        name: updatedBranch.name,
        changes: updateBranchInput,
      },
    });

    return this.mapPrismaBranchToEntity(updatedBranch);
  }

  async remove(id: string) {
    const branch = await this.findOne(id); // Ensure branch exists
    if (!branch.isActive) {
      return branch; // Return already inactive branch, already mapped by findOne
    }
    const removedBranch = await this.prisma.branch.update({
      where: { id },
      data: { isActive: false }, // Soft delete
    });

    // Log the branch deactivation - scoped to this branch
    await this.auditLogService.create({
      action: 'DELETE_BRANCH',
      entityType: 'Branch',
      entityId: id,
      description: `Branch deactivated: ${branch.name}`,
      branchId: id, // Branch-scoped: log belongs to this branch
      metadata: {
        name: branch.name,
      },
    });

    return this.mapPrismaBranchToEntity(removedBranch);
  }

  async findBranchSettings(branchId: string) {
    await this.findOne(branchId); // Ensure branch exists
    return this.prisma.branchSetting.findMany({
      where: { branchId },
    });
  }

  async updateBranchSetting(
    branchId: string,
    { key, value }: UpdateBranchSettingInput,
  ) {
    await this.findOne(branchId); // Ensure branch exists

    // First check if the setting exists
    const existingSetting = await this.prisma.branchSetting.findFirst({
      where: {
        branchId,
        key,
      },
    });

    let setting;
    if (existingSetting) {
      // Update existing setting
      setting = await this.prisma.branchSetting.update({
        where: { id: existingSetting.id },
        data: { value },
      });
    } else {
      // Create new setting
      setting = await this.prisma.branchSetting.create({
        data: { branchId, key, value },
      });
    }

    // Log the setting change - scoped to this branch
    await this.auditLogService.create({
      action: 'UPDATE_BRANCH_SETTINGS',
      entityType: 'BranchSetting',
      entityId: setting.id,
      description: `Branch setting ${existingSetting ? 'updated' : 'created'}: ${key}`,
      branchId: branchId, // Branch-scoped: log belongs to this branch
      metadata: {
        key,
        value,
        action: existingSetting ? 'update' : 'create',
      },
    });

    return setting;
  }

  // Helper to load settings for a branch, can be used by DataLoader
  async getSettingsByBranchId(branchId: string) {
    return await this.prisma.branchSetting.findMany({
      where: { branchId },
    });
  }

  private mapPrismaBranchToEntity(prismaBranch: any): Branch {
    // Convert null values to undefined for optional fields
    const branch: Branch = {
      id: prismaBranch.id,
      name: prismaBranch.name,
      isActive: prismaBranch.isActive,
      createdAt: prismaBranch.createdAt,
      updatedAt: prismaBranch.updatedAt,
    };

    // Add optional fields, converting null to undefined
    if (prismaBranch.address !== null && prismaBranch.address !== undefined) {
      branch.address = prismaBranch.address;
    }
    if (prismaBranch.city !== null && prismaBranch.city !== undefined) {
      branch.city = prismaBranch.city;
    }
    if (prismaBranch.state !== null && prismaBranch.state !== undefined) {
      branch.state = prismaBranch.state;
    }
    if (prismaBranch.postalCode !== null && prismaBranch.postalCode !== undefined) {
      branch.postalCode = prismaBranch.postalCode;
    }
    if (prismaBranch.country !== null && prismaBranch.country !== undefined) {
      branch.country = prismaBranch.country;
    }
    if (prismaBranch.phoneNumber !== null && prismaBranch.phoneNumber !== undefined) {
      branch.phoneNumber = prismaBranch.phoneNumber;
    }
    if (prismaBranch.email !== null && prismaBranch.email !== undefined) {
      branch.email = prismaBranch.email;
    }
    if (prismaBranch.website !== null && prismaBranch.website !== undefined) {
      branch.website = prismaBranch.website;
    }
    if (prismaBranch.description !== null && prismaBranch.description !== undefined) {
      branch.description = prismaBranch.description;
    }
    if (prismaBranch.logoUrl !== null && prismaBranch.logoUrl !== undefined) {
      branch.logoUrl = prismaBranch.logoUrl;
    }
    if (prismaBranch.establishedAt !== null && prismaBranch.establishedAt !== undefined) {
      branch.establishedAt = prismaBranch.establishedAt;
    }
    if (prismaBranch.emailDisplayName !== null && prismaBranch.emailDisplayName !== undefined) {
      branch.emailDisplayName = prismaBranch.emailDisplayName;
    }
    if (prismaBranch.emailSignature !== null && prismaBranch.emailSignature !== undefined) {
      branch.emailSignature = prismaBranch.emailSignature;
    }
    if (prismaBranch.smsDisplayName !== null && prismaBranch.smsDisplayName !== undefined) {
      branch.smsDisplayName = prismaBranch.smsDisplayName;
    }
    if (prismaBranch.settings !== null && prismaBranch.settings !== undefined) {
      branch.settings = prismaBranch.settings;
    }
    if (prismaBranch.organisationId !== null && prismaBranch.organisationId !== undefined) {
      branch.organisationId = prismaBranch.organisationId;
    }

    return branch;
  }
}
