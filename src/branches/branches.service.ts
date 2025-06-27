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

// Helper function to map Prisma Branch to GraphQL Branch
function toGraphQLBranch(prismaBranch: PrismaBranch): Branch {
  return {
    ...prismaBranch,

    address: prismaBranch.address,

    city: prismaBranch.city,

    state: prismaBranch.state,

    postalCode: prismaBranch.postalCode,

    country: prismaBranch.country,

    phoneNumber: prismaBranch.phoneNumber,

    email: prismaBranch.email,

    website: prismaBranch.website,

    establishedAt: prismaBranch.establishedAt,

    // settings are handled by ResolveField, not directly mapped here
    settings: null,
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

  constructor(private readonly prisma: PrismaService) {}

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
    return toGraphQLBranch(newBranch);
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
      items: prismaBranches.map(toGraphQLBranch),
      totalCount,
      hasNextPage: skip + take < totalCount,
    };
  }

  async findOne(id: string) {
    const branch = await this.prisma.branch.findUnique({
      where: { id },
    });
    if (!branch) {
      throw new NotFoundException(`Branch with ID ${id} not found`);
    }
    return toGraphQLBranch(branch);
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
    return toGraphQLBranch(updatedBranch);
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
    return toGraphQLBranch(removedBranch);
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

    return this.prisma.branchSetting.upsert({
      where: { branchId_key: { branchId, key } },
      update: { value },
      create: { branchId, key, value },
    });
  }

  // Helper to load settings for a branch, can be used by DataLoader
  async getSettingsByBranchId(branchId: string) {
    return await this.prisma.branchSetting.findMany({
      where: { branchId },
    });
  }
}
