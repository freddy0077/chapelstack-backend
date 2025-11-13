import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

export interface CreateUserInput {
  email: string;
  name: string;
  password: string;
  organisationId?: string;
  role: string;
  status?: string;
}

export interface UpdateUserInput {
  email?: string;
  name?: string;
  role?: string;
  status?: string;
  organisationId?: string;
}

@Injectable()
export class UserManagementService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all users with pagination
   */
  async getUsers(skip: number = 0, take: number = 10) {
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          isActive: true,
          organisationId: true,
          createdAt: true,
          updatedAt: true,
          lastLoginAt: true,
          organisation: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.user.count(),
    ]);

    // Map users to include computed name field
    const mappedUsers = users.map(user => ({
      ...user,
      name: user.firstName && user.lastName 
        ? `${user.firstName} ${user.lastName}` 
        : user.firstName || user.lastName || user.email,
      status: user.isActive ? 'active' : 'inactive',
      role: 'user', // Default role, can be enhanced with actual role data
      lastLogin: user.lastLoginAt,
    }));

    return {
      users: mappedUsers,
      total,
      skip,
      take,
    };
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
        organisationId: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
        organisation: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Map user to include computed name field
    return {
      ...user,
      name: user.firstName && user.lastName 
        ? `${user.firstName} ${user.lastName}` 
        : user.firstName || user.lastName || user.email,
      status: user.isActive ? 'active' : 'inactive',
      role: 'user', // Default role, can be enhanced with actual role data
      lastLogin: user.lastLoginAt,
    };
  }

  /**
   * Create new user
   */
  async createUser(input: CreateUserInput) {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(input.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: input.email,
        firstName: input.name?.split(' ')[0] || '',
        lastName: input.name?.split(' ').slice(1).join(' ') || '',
        passwordHash: hashedPassword,
        organisationId: input.organisationId,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
        organisationId: true,
        createdAt: true,
      },
    });

    return user;
  }

  /**
   * Update user
   */
  async updateUser(id: string, input: UpdateUserInput) {
    const user = await this.prisma.user.update({
      where: { id },
      data: input,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
        organisationId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Map user to include computed name field
    return {
      ...user,
      name: user.firstName && user.lastName 
        ? `${user.firstName} ${user.lastName}` 
        : user.firstName || user.lastName || user.email,
      status: user.isActive ? 'active' : 'inactive',
      role: 'user',
    };
  }

  /**
   * Delete user
   */
  async deleteUser(id: string) {
    await this.prisma.user.delete({
      where: { id },
    });

    return { success: true, message: 'User deleted successfully' };
  }

  /**
   * Reset user password
   */
  async resetUserPassword(id: string, newPassword: string) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id },
      data: {
        passwordHash: hashedPassword,
      },
    });

    return { success: true, message: 'Password reset successfully' };
  }

  /**
   * Search users
   */
  async searchUsers(query: string, skip: number = 0, take: number = 10) {
    const users = await this.prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: query, mode: 'insensitive' } },
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
        ],
      },
      skip,
      take,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        firstName: 'asc',
      },
    });

    const total = await this.prisma.user.count({
      where: {
        OR: [
          { email: { contains: query, mode: 'insensitive' } },
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
        ],
      },
    });

    // Map users to include computed name field
    const mappedUsers = users.map(user => ({
      ...user,
      name: user.firstName && user.lastName 
        ? `${user.firstName} ${user.lastName}` 
        : user.firstName || user.lastName || user.email,
      status: user.isActive ? 'active' : 'inactive',
      role: 'user',
    }));

    return {
      users: mappedUsers,
      total,
      skip,
      take,
    };
  }

  /**
   * Get users by role
   */
  async getUsersByRole(role: string, skip: number = 0, take: number = 10) {
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where: { roles: { some: { id: role } } },
        skip,
        take,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.user.count({ where: { roles: { some: { id: role } } } }),
    ]);

    // Map users to include computed name field
    const mappedUsers = users.map(user => ({
      ...user,
      name: user.firstName && user.lastName 
        ? `${user.firstName} ${user.lastName}` 
        : user.firstName || user.lastName || user.email,
      status: user.isActive ? 'active' : 'inactive',
      role: 'user',
    }));

    return {
      users: mappedUsers,
      total,
      skip,
      take,
    };
  }

  /**
   * Get user activity
   */
  async getUserActivity(userId: string, limit: number = 20) {
    const activities = await this.prisma.auditLog.findMany({
      where: {
        userId,
      },
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        action: true,
        entityType: true,
        entityId: true,
        description: true,
        metadata: true,
        createdAt: true,
      },
    });

    return activities;
  }
}
