import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { User } from '@prisma/client';
import { PaginationInput } from '../../common/dto/pagination.input';

import * as bcrypt from 'bcrypt';

@Injectable()
export class UserAdminService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get the roleId for the 'SUPER_ADMIN' role, creating it if it does not exist
   */
  async getSuperAdminRoleId(): Promise<string> {
    let role = await this.prisma.role.findFirst({
      where: { name: 'SUPER_ADMIN' },
    });
    if (!role) {
      role = await this.prisma.role.create({
        data: {
          name: 'SUPER_ADMIN',
          description: 'Full system access',
        },
      });
    }
    return role.id;
  }

  /**
   * Get the roleId for the 'BRANCH_ADMIN' role, creating it if it does not exist
   */
  async getBranchAdminRoleId(): Promise<string> {
    let role = await this.prisma.role.findFirst({
      where: { name: 'BRANCH_ADMIN' },
    });
    if (!role) {
      role = await this.prisma.role.create({
        data: {
          name: 'BRANCH_ADMIN',
          description: 'Branch administrator with full branch permissions',
        },
      });
    }
    return role.id;
  }

  /**
   * Create a new user with hashed password
   */
  async createUser({
    email,
    password,
    firstName,
    lastName,
    isActive,
    organisationId,
  }: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
    organisationId: string;
  }) {
    // Check if a user with this email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('A user with this email already exists.');
    }
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    return this.prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        isActive,
        isEmailVerified: false,
        organisation: {
          connect: { id: organisationId },
        },
        member: {
          create: {
            firstName,
            lastName,
            email,
            organisation: {
              connect: { id: organisationId },
            },
            gender: 'UNKNOWN',
          },
        },
      },
    });
  }

  /**
   * Find all users with pagination
   */
  async findAllUsers(
    paginationInput: PaginationInput,
    filterOptions?: {
      isActive?: boolean;
      emailContains?: string;
      nameContains?: string;
      roleId?: string;
      organisationId?: string;
      branchId?: string;
    },
  ) {
    const { skip = 0, take = 10 } = paginationInput;
    const where: any = {};

    if (filterOptions) {
      if (filterOptions.isActive !== undefined) {
        where.isActive = filterOptions.isActive;
      }
      if (filterOptions.emailContains) {
        where.email = {
          contains: filterOptions.emailContains,
          mode: 'insensitive',
        };
      }
      if (filterOptions.nameContains) {
        where.OR = [
          {
            firstName: {
              contains: filterOptions.nameContains,
              mode: 'insensitive',
            },
          },
          {
            lastName: {
              contains: filterOptions.nameContains,
              mode: 'insensitive',
            },
          },
        ];
      }
      if (filterOptions.roleId) {
        where.roles = {
          some: { id: filterOptions.roleId },
        };
      }
      if (filterOptions.organisationId) {
        where.organisationId = filterOptions.organisationId;
      }
      if (filterOptions.branchId) {
        where.userBranches = {
          some: { branchId: filterOptions.branchId },
        };
      }
    }

    // Exclude system-level admin roles (SUPER_ADMIN, SUBSCRIPTION_MANAGER, ADMIN)
    where.roles = {
      ...(where.roles || {}),
      none: {
        name: {
          in: ['SUPER_ADMIN', 'SUBSCRIPTION_MANAGER', 'ADMIN'],
        },
      },
    };

    const [users, totalCount] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        skip,
        take,
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          member: true,
          roles: true,
          userBranches: {
            include: {
              branch: true,
              role: true,
            },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      items: users,
      totalCount,
      hasNextPage: skip + take < totalCount,
    };
  }

  /**
   * Find a user by ID
   */
  async findUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        roles: true,
        userBranches: {
          include: {
            branch: true,
            role: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  /**
   * Update a user's active status (activate/deactivate)
   */
  async updateUserActiveStatus(id: string, isActive: boolean) {
    const user = await this.findUserById(id);

    return this.prisma.user.update({
      where: { id },
      data: { isActive },
      include: {
        roles: true,
        userBranches: {
          include: {
            branch: true,
            role: true,
          },
        },
      },
    });
  }

  /**
   * Assign a system role to a user
   */
  async assignRoleToUser(userId: string, roleId: string) {
    const user = await this.findUserById(userId);
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${roleId} not found`);
    }

    // Check if user already has this role
    const existingRole = user.roles.find((r) => r.id === roleId);
    if (existingRole) {
      throw new ConflictException(`User already has role ${role.name}`);
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        roles: {
          connect: { id: roleId },
        },
      },
      include: {
        roles: true,
        userBranches: {
          include: {
            branch: true,
            role: true,
          },
        },
      },
    });
  }

  /**
   * Remove a system role from a user
   */
  async removeRoleFromUser(userId: string, roleId: string) {
    const user = await this.findUserById(userId);
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${roleId} not found`);
    }

    // Check if user has this role
    const existingRole = user.roles.find((r) => r.id === roleId);
    if (!existingRole) {
      throw new NotFoundException(`User does not have role ${role.name}`);
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        roles: {
          disconnect: { id: roleId },
        },
      },
      include: {
        roles: true,
        userBranches: {
          include: {
            branch: true,
            role: true,
          },
        },
      },
    });
  }

  /**
   * Assign a branch role to a user
   */
  async assignBranchRoleToUser(
    userId: string,
    branchId: string,
    roleId: string,
    assignedBy?: string,
  ) {
    const user = await this.findUserById(userId);

    const branch = await this.prisma.branch.findUnique({
      where: { id: branchId },
    });
    if (!branch) {
      throw new NotFoundException(`Branch with ID ${branchId} not found`);
    }

    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
    });
    if (!role) {
      throw new NotFoundException(`Role with ID ${roleId} not found`);
    }

    // Check if user already has this role in this branch
    const existingUserBranch = user.userBranches.find(
      (ub) => ub.branchId === branchId && ub.roleId === roleId,
    );
    if (existingUserBranch) {
      throw new ConflictException(
        `User already has role ${role.name} in branch ${branch.name}`,
      );
    }

    const userBranch = await this.prisma.userBranch.create({
      data: {
        userId,
        branchId,
        roleId,
        assignedBy,
      },
      include: {
        user: true,
        branch: {
          include: {
            settings: true,
          },
        },
        role: true,
      },
    });
    // Fix null values for optional fields to undefined for GraphQL compatibility
    // NOTE: Returning as-is because Prisma returns null for nullable fields, but GraphQL expects undefined for optional fields.
    // This type mismatch is a known issue between Prisma and GraphQL code-first.
    // For a robust solution, use a mapping function or class-transformer in the resolver layer.
    return userBranch;
  }

  /**
   * Remove a branch role from a user
   */
  async removeBranchRoleFromUser(
    userId: string,
    branchId: string,
    roleId: string,
  ) {
    const user = await this.findUserById(userId);

    // Check if user has this role in this branch
    const existingUserBranch = user.userBranches.find(
      (ub) => ub.branchId === branchId && ub.roleId === roleId,
    );
    if (!existingUserBranch) {
      throw new NotFoundException(
        `User does not have the specified role in this branch`,
      );
    }

    return this.prisma.userBranch.delete({
      where: {
        userId_roleId: {
          userId,
          roleId,
        },
      },
      include: {
        user: true,
        branch: true,
        role: true,
      },
    });
  }

  /**
   * Search users by specific roles with enhanced filtering
   */
  async searchUsersByRole(
    filter: {
      organisationId: string;
      branchId?: string;
      search?: string;
      roles: string[];
    },
    pagination: PaginationInput = { skip: 0, take: 20 },
  ) {
    const { organisationId, branchId, search, roles } = filter;
    const { skip = 0, take = 20 } = pagination;

    // Build search conditions for name, email, phone
    const searchConditions = search
      ? {
          OR: [
            {
              firstName: {
                contains: search,
                mode: 'insensitive' as const,
              },
            },
            {
              lastName: {
                contains: search,
                mode: 'insensitive' as const,
              },
            },
            {
              email: {
                contains: search,
                mode: 'insensitive' as const,
              },
            },
            {
              phoneNumber: {
                contains: search,
              },
            },
          ],
        }
      : {};

    // Build role filter conditions
    const roleConditions = {
      userBranches: {
        some: {
          ...(branchId && { branchId }),
          role: {
            name: { in: roles },
          },
        },
      },
    };

    // Build base where clause
    const where = {
      organisationId,
      isActive: true, // Only return active users
      ...searchConditions,
      ...roleConditions,
    };

    // Execute query with pagination
    const [users, totalCount] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        include: {
          userBranches: {
            include: {
              branch: true,
              role: true,
            },
            where: {
              ...(branchId && { branchId }),
            },
          },
        },
        skip,
        take,
        orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      items: users,
      totalCount,
      hasNextPage: skip + take < totalCount,
      hasPreviousPage: skip > 0,
    };
  }

  /**
   * Search specifically for pastors
   */
  async searchPastors(
    filter: {
      organisationId: string;
      branchId?: string;
      search?: string;
    },
    pagination: PaginationInput = { skip: 0, take: 20 },
  ) {
    return this.searchUsersByRole(
      {
        ...filter,
        roles: ['PASTOR'],
      },
      pagination,
    );
  }

  /**
   * Search for pastoral staff (pastors, branch admins, staff)
   */
  async searchPastoralStaff(
    filter: {
      organisationId: string;
      branchId?: string;
      search?: string;
    },
    pagination: PaginationInput = { skip: 0, take: 20 },
  ) {
    return this.searchUsersByRole(
      {
        ...filter,
        roles: ['PASTOR', 'BRANCH_ADMIN', 'STAFF'],
      },
      pagination,
    );
  }

  /**
   * Link an existing member to an existing user
   */
  async linkMemberToUser(userId: string, memberId: string) {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { member: true },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Check if user already has a linked member
    if (user.member) {
      throw new ConflictException(
        `User already has a linked member: ${user.member.firstName} ${user.member.lastName}`,
      );
    }

    // Check if member exists
    const member = await this.prisma.member.findUnique({
      where: { id: memberId },
      include: { user: true },
    });

    if (!member) {
      throw new NotFoundException(`Member with ID ${memberId} not found`);
    }

    // Check if member is already linked to another user
    if (member.userId) {
      throw new ConflictException(
        `Member is already linked to another user account`,
      );
    }

    // Link member to user
    const updatedMember = await this.prisma.member.update({
      where: { id: memberId },
      data: {
        userId: userId,
      },
    });

    // Return updated user with member
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        member: true,
        roles: true,
        userBranches: {
          include: {
            branch: true,
            role: true,
          },
        },
      },
    });
  }

  /**
   * Unlink member from user
   */
  async unlinkMemberFromUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { member: true },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (!user.member) {
      throw new NotFoundException(`User does not have a linked member`);
    }

    // Unlink member from user
    await this.prisma.member.update({
      where: { id: user.member.id },
      data: {
        userId: null,
      },
    });

    // Return updated user
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        member: true,
        roles: true,
        userBranches: {
          include: {
            branch: true,
            role: true,
          },
        },
      },
    });
  }

  /**
   * Create a user account from an existing member
   */
  async createUserFromMember(data: {
    memberId: string;
    email: string;
    password: string;
    roleIds: string[];
    organisationId: string;
    branchId: string;
  }) {
    // Check if member exists
    const member = await this.prisma.member.findUnique({
      where: { id: data.memberId },
      include: { user: true },
    });

    if (!member) {
      throw new NotFoundException(`Member with ID ${data.memberId} not found`);
    }

    // Check if member already has a linked user
    if (member.userId) {
      throw new ConflictException(
        `Member already has a linked user account`,
      );
    }

    // Check if email is already in use
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictException(
        `Email ${data.email} is already in use`,
      );
    }

    // Validate roles exist
    const roles = await this.prisma.role.findMany({
      where: { id: { in: data.roleIds } },
    });

    if (roles.length !== data.roleIds.length) {
      throw new NotFoundException(`One or more role IDs are invalid`);
    }

    // Validate organisation and branch exist
    const organisation = await this.prisma.organisation.findUnique({
      where: { id: data.organisationId },
    });

    if (!organisation) {
      throw new NotFoundException(
        `Organisation with ID ${data.organisationId} not found`,
      );
    }

    const branch = await this.prisma.branch.findUnique({
      where: { id: data.branchId },
    });

    if (!branch) {
      throw new NotFoundException(`Branch with ID ${data.branchId} not found`);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user and link to member in a transaction
    const user = await this.prisma.$transaction(async (prisma) => {
      // Create user
      const newUser = await prisma.user.create({
        data: {
          email: data.email,
          passwordHash: hashedPassword,
          firstName: member.firstName,
          lastName: member.lastName,
          phoneNumber: member.phoneNumber,
          isActive: true,
          isEmailVerified: false,
          organisationId: data.organisationId,
          roles: {
            connect: data.roleIds.map((id) => ({ id })),
          },
        },
      });

      // Create UserBranch entries for each role
      for (const roleId of data.roleIds) {
        await prisma.userBranch.create({
          data: {
            userId: newUser.id,
            branchId: data.branchId,
            roleId: roleId,
          },
        });
      }

      // Link member to user
      await prisma.member.update({
        where: { id: data.memberId },
        data: {
          userId: newUser.id,
        },
      });

      return newUser;
    });

    // Return complete user with relations
    return this.prisma.user.findUnique({
      where: { id: user.id },
      include: {
        member: true,
        roles: true,
        userBranches: {
          include: {
            branch: true,
            role: true,
          },
        },
      },
    });
  }
}
