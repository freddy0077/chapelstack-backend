import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private prisma: PrismaService) {}

  async findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async create(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    roleId?: string;
    organisationId?: string;
  }) {
    try {
      const passwordHash: string = await bcrypt.hash(data.password, 10);
      return await this.prisma.user.create({
        data: {
          email: data.email,
          passwordHash,
          firstName: data.firstName,
          lastName: data.lastName,
          ...(data.organisationId
            ? { organisationId: data.organisationId }
            : {}),
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`Error creating user: ${error.message}`, error.stack);
      } else {
        this.logger.error(`Error creating user: ${String(error)}`);
      }
      throw error;
    }
  }

  async updateUserPassword(userId: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      // Validate password
      if (!newPassword || newPassword.length < 8) {
        throw new BadRequestException('Password must be at least 8 characters long');
      }

      // Check if user exists
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Hash new password
      const passwordHash = await bcrypt.hash(newPassword, 10);

      // Update user password
      await this.prisma.user.update({
        where: { id: userId },
        data: { passwordHash },
      });

      this.logger.log(`Password updated successfully for user: ${userId}`);
      return {
        success: true,
        message: 'Password updated successfully',
      };
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`Error updating password: ${error.message}`, error.stack);
      } else {
        this.logger.error(`Error updating password: ${String(error)}`);
      }
      throw error;
    }
  }
}
