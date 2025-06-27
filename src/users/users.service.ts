import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import bcrypt from "bcrypt";

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
      return await this.prisma.user.create({
        data: {
          email: data.email,
          passwordHash: await bcrypt.hash(data.password, 10),
          firstName: data.firstName,
          lastName: data.lastName,
          ...(data.organisationId ? { organisationId: data.organisationId } : {}),
        },
      });
    } catch (error: any) {
      this.logger.error(`Error creating user: ${error.message}`, error.stack);
      throw error;
    }
  }
}
