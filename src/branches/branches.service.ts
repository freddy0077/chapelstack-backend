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
  return {
    ...prismaBranch,

    address: prismaBranch.address === null ? undefined : prismaBranch.address,

    city: prismaBranch.city === null ? undefined : prismaBranch.city,

    state: prismaBranch.state === null ? undefined : prismaBranch.state,

    postalCode:
      prismaBranch.postalCode === null ? undefined : prismaBranch.postalCode,

    country: prismaBranch.country === null ? undefined : prismaBranch.country,

    phoneNumber:
      prismaBranch.phoneNumber === null ? undefined : prismaBranch.phoneNumber,

    email: prismaBranch.email === null ? undefined : prismaBranch.email,

    website: prismaBranch.website === null ? undefined : prismaBranch.website,

    establishedAt:
      prismaBranch.establishedAt === null
        ? undefined
        : prismaBranch.establishedAt,

    description:
      prismaBranch.description === null ? undefined : prismaBranch.description,

    emailDisplayName:
      prismaBranch.emailDisplayName === null
        ? undefined
        : prismaBranch.emailDisplayName,

    emailSignature:
      prismaBranch.emailSignature === null
        ? undefined
        : prismaBranch.emailSignature,

    smsDisplayName:
      prismaBranch.smsDisplayName === null
        ? undefined
        : prismaBranch.smsDisplayName,

    // Map settings if they are included in the query result
    settings:
      prismaBranch.settings === null ? undefined : prismaBranch.settings,

    // Convert organisationId from null to undefined if needed
    organisationId:
      prismaBranch.organisationId === null
        ? undefined
        : prismaBranch.organisationId,
  };
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

    const updatedBranch = await this.prisma.branch.update({
      where: { id },
      data: updateBranchInput,
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
    return {
      id: prismaBranch.id,
      name: prismaBranch.name,
      address: prismaBranch.address === null ? undefined : prismaBranch.address,
      city: prismaBranch.city === null ? undefined : prismaBranch.city,
      state: prismaBranch.state === null ? undefined : prismaBranch.state,
      postalCode:
        prismaBranch.postalCode === null ? undefined : prismaBranch.postalCode,
      country: prismaBranch.country === null ? undefined : prismaBranch.country,
      phoneNumber:
        prismaBranch.phoneNumber === null
          ? undefined
          : prismaBranch.phoneNumber,
      email: prismaBranch.email === null ? undefined : prismaBranch.email,
      website: prismaBranch.website === null ? undefined : prismaBranch.website,
      establishedAt:
        prismaBranch.establishedAt === null
          ? undefined
          : prismaBranch.establishedAt,
      isActive: prismaBranch.isActive,
      createdAt: prismaBranch.createdAt,
      updatedAt: prismaBranch.updatedAt,
      settings:
        prismaBranch.settings === null ? undefined : prismaBranch.settings,
      organisationId:
        prismaBranch.organisationId === null
          ? undefined
          : prismaBranch.organisationId,
    };
  }
}
