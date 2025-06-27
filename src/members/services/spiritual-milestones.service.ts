import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit/services/audit-log.service';
import { CreateSpiritualMilestoneInput } from '../dto/create-spiritual-milestone.input';
import { UpdateSpiritualMilestoneInput } from '../dto/update-spiritual-milestone.input';
import { SpiritualMilestone } from '../entities/spiritual-milestone.entity';
import { Prisma } from '@prisma/client';

@Injectable()
export class SpiritualMilestonesService {
  private readonly logger = new Logger(SpiritualMilestonesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async create(
    createSpiritualMilestoneInput: CreateSpiritualMilestoneInput,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<SpiritualMilestone> {
    try {
      // Check if member exists
      const member = await this.prisma.member.findUnique({
        where: { id: createSpiritualMilestoneInput.memberId },
      });

      if (!member) {
        throw new NotFoundException(
          `Member with ID ${createSpiritualMilestoneInput.memberId} not found`,
        );
      }

      const milestone = await this.prisma.spiritualMilestone.create({
        data: {
          type: createSpiritualMilestoneInput.type as unknown as string,
          date: createSpiritualMilestoneInput.date,
          location: createSpiritualMilestoneInput.location,
          performedBy: createSpiritualMilestoneInput.performedBy,
          description: createSpiritualMilestoneInput.description,
          additionalDetails:
            createSpiritualMilestoneInput.additionalDetails as Prisma.InputJsonValue,
          memberId: createSpiritualMilestoneInput.memberId,
        },
        include: {
          member: true,
        },
      });

      // Log the action
      await this.auditLogService.create({
        action: 'CREATE',
        entityType: 'SpiritualMilestone',
        entityId: milestone.id,
        description: `Created spiritual milestone (${milestone.type}) for member: ${member.firstName} ${member.lastName}`,
        userId,
        ipAddress,
        userAgent,
      });

      // Update specific member fields based on milestone type
      if (createSpiritualMilestoneInput.type === 'BAPTISM') {
        await this.prisma.member.update({
          where: { id: createSpiritualMilestoneInput.memberId },
          data: {
            baptismDate: createSpiritualMilestoneInput.date,
          },
        });
      } else if (createSpiritualMilestoneInput.type === 'CONFIRMATION') {
        await this.prisma.member.update({
          where: { id: createSpiritualMilestoneInput.memberId },
          data: {
            confirmationDate: createSpiritualMilestoneInput.date,
          },
        });
      }

      return milestone as unknown as SpiritualMilestone;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Error creating spiritual milestone: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  async findAll(
    skip = 0,
    take = 10,
    where?: Prisma.SpiritualMilestoneWhereInput,
    orderBy?: Prisma.SpiritualMilestoneOrderByWithRelationInput,
  ): Promise<SpiritualMilestone[]> {
    try {
      const milestones = await this.prisma.spiritualMilestone.findMany({
        skip,
        take,
        where,
        orderBy,
        include: {
          member: true,
        },
      });

      return milestones as unknown as SpiritualMilestone[];
    } catch (error) {
      this.logger.error(
        `Error finding spiritual milestones: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  async findOne(id: string): Promise<SpiritualMilestone> {
    try {
      const milestone = await this.prisma.spiritualMilestone.findUnique({
        where: { id },
        include: {
          member: true,
        },
      });

      if (!milestone) {
        throw new NotFoundException(
          `Spiritual milestone with ID ${id} not found`,
        );
      }

      return milestone as unknown as SpiritualMilestone;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Error finding spiritual milestone: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  async findByMember(memberId: string): Promise<SpiritualMilestone[]> {
    try {
      const milestones = await this.prisma.spiritualMilestone.findMany({
        where: { memberId },
        include: {
          member: true,
        },
        orderBy: {
          date: 'desc',
        },
      });

      return milestones as unknown as SpiritualMilestone[];
    } catch (error) {
      this.logger.error(
        `Error finding spiritual milestones by member: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  async update(
    id: string,
    updateSpiritualMilestoneInput: UpdateSpiritualMilestoneInput,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<SpiritualMilestone> {
    try {
      // Check if milestone exists
      const existingMilestone = await this.prisma.spiritualMilestone.findUnique(
        {
          where: { id },
          include: {
            member: true,
          },
        },
      );

      if (!existingMilestone) {
        throw new NotFoundException(
          `Spiritual milestone with ID ${id} not found`,
        );
      }

      // If memberId is being updated, check if the new member exists
      if (
        updateSpiritualMilestoneInput.memberId &&
        updateSpiritualMilestoneInput.memberId !== existingMilestone.memberId
      ) {
        const member = await this.prisma.member.findUnique({
          where: { id: updateSpiritualMilestoneInput.memberId },
        });

        if (!member) {
          throw new NotFoundException(
            `Member with ID ${updateSpiritualMilestoneInput.memberId} not found`,
          );
        }
      }

      // Update milestone
      const updatedMilestone = await this.prisma.spiritualMilestone.update({
        where: { id },
        data: {
          type: updateSpiritualMilestoneInput.type as unknown as string,
          date: updateSpiritualMilestoneInput.date,
          location: updateSpiritualMilestoneInput.location,
          performedBy: updateSpiritualMilestoneInput.performedBy,
          description: updateSpiritualMilestoneInput.description,
          additionalDetails:
            updateSpiritualMilestoneInput.additionalDetails as Prisma.InputJsonValue,
          memberId: updateSpiritualMilestoneInput.memberId,
        },
        include: {
          member: true,
        },
      });

      // Log the action
      await this.auditLogService.create({
        action: 'UPDATE',
        entityType: 'SpiritualMilestone',
        entityId: id,
        description: `Updated spiritual milestone (${updatedMilestone.type}) for member: ${updatedMilestone.member.firstName} ${updatedMilestone.member.lastName}`,
        userId,
        ipAddress,
        userAgent,
      });

      // Update specific member fields based on milestone type if date changed
      if (
        updateSpiritualMilestoneInput.type === 'BAPTISM' &&
        updateSpiritualMilestoneInput.date
      ) {
        await this.prisma.member.update({
          where: { id: updatedMilestone.memberId },
          data: {
            baptismDate: updateSpiritualMilestoneInput.date,
          },
        });
      } else if (
        updateSpiritualMilestoneInput.type === 'CONFIRMATION' &&
        updateSpiritualMilestoneInput.date
      ) {
        await this.prisma.member.update({
          where: { id: updatedMilestone.memberId },
          data: {
            confirmationDate: updateSpiritualMilestoneInput.date,
          },
        });
      }

      return updatedMilestone as unknown as SpiritualMilestone;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Error updating spiritual milestone: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  async remove(
    id: string,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<boolean> {
    try {
      // Check if milestone exists
      const milestone = await this.prisma.spiritualMilestone.findUnique({
        where: { id },
        include: {
          member: true,
        },
      });

      if (!milestone) {
        throw new NotFoundException(
          `Spiritual milestone with ID ${id} not found`,
        );
      }

      // Delete milestone
      await this.prisma.spiritualMilestone.delete({
        where: { id },
      });

      // Log the action
      await this.auditLogService.create({
        action: 'DELETE',
        entityType: 'SpiritualMilestone',
        entityId: id,
        description: `Deleted spiritual milestone (${milestone.type}) for member: ${milestone.member.firstName} ${milestone.member.lastName}`,
        userId,
        ipAddress,
        userAgent,
      });

      return true;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Error removing spiritual milestone: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  async count(where?: Prisma.SpiritualMilestoneWhereInput): Promise<number> {
    try {
      return await this.prisma.spiritualMilestone.count({ where });
    } catch (error) {
      this.logger.error(
        `Error counting spiritual milestones: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }
}
