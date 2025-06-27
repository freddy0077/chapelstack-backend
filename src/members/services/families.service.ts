import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit/services/audit-log.service';
import { CreateFamilyInput } from '../dto/create-family.input';
import { UpdateFamilyInput } from '../dto/update-family.input';
import { CreateFamilyRelationshipInput } from '../dto/create-family-relationship.input';
import { UpdateFamilyRelationshipInput } from '../dto/update-family-relationship.input';
import {
  Family,
  FamilyRelationship,
  FamilyRelationshipType,
} from '../entities/family.entity';
import { Prisma } from '@prisma/client';

@Injectable()
export class FamiliesService {
  private readonly logger = new Logger(FamiliesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async createFamily(
    createFamilyInput: CreateFamilyInput,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<Family> {
    try {
      // Create family
      const family = await this.prisma.family.create({
        data: {
          name: createFamilyInput.name,
          address: createFamilyInput.address,
          city: createFamilyInput.city,
          state: createFamilyInput.state,
          postalCode: createFamilyInput.postalCode,
          country: createFamilyInput.country,
          phoneNumber: createFamilyInput.phoneNumber,
          customFields: createFamilyInput.customFields as Prisma.InputJsonValue,
          members: createFamilyInput.memberIds
            ? {
                connect: createFamilyInput.memberIds.map((id) => ({ id })),
              }
            : undefined,
        },
        include: {
          members: true,
        },
      });

      // Log the action
      await this.auditLogService.create({
        action: 'CREATE',
        entityType: 'Family',
        entityId: family.id,
        description: `Created family: ${family.name}`,
        userId,
        ipAddress,
        userAgent,
      });

      return family as unknown as Family;
    } catch (error) {
      this.logger.error(
        `Error creating family: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  async findAllFamilies(
    skip = 0,
    take = 10,
    where?: Prisma.FamilyWhereInput,
    orderBy?: Prisma.FamilyOrderByWithRelationInput,
  ): Promise<Family[]> {
    try {
      const families = await this.prisma.family.findMany({
        skip,
        take,
        where,
        orderBy,
        include: {
          members: true,
        },
      });

      return families as unknown as Family[];
    } catch (error) {
      this.logger.error(
        `Error finding families: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  async findFamilyById(id: string): Promise<Family> {
    try {
      const family = await this.prisma.family.findUnique({
        where: { id },
        include: {
          members: true,
        },
      });

      if (!family) {
        throw new NotFoundException(`Family with ID ${id} not found`);
      }

      return family as unknown as Family;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Error finding family: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  async updateFamily(
    id: string,
    updateFamilyInput: UpdateFamilyInput,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<Family> {
    try {
      // Check if family exists
      const existingFamily = await this.prisma.family.findUnique({
        where: { id },
      });

      if (!existingFamily) {
        throw new NotFoundException(`Family with ID ${id} not found`);
      }

      // Update family
      const updatedFamily = await this.prisma.family.update({
        where: { id },
        data: {
          name: updateFamilyInput.name,
          address: updateFamilyInput.address,
          city: updateFamilyInput.city,
          state: updateFamilyInput.state,
          postalCode: updateFamilyInput.postalCode,
          country: updateFamilyInput.country,
          phoneNumber: updateFamilyInput.phoneNumber,
          customFields: updateFamilyInput.customFields as Prisma.InputJsonValue,
          members: updateFamilyInput.memberIds
            ? {
                set: [], // Clear existing connections
                connect: updateFamilyInput.memberIds.map((id) => ({ id })),
              }
            : undefined,
        },
        include: {
          members: true,
        },
      });

      // Log the action
      await this.auditLogService.create({
        action: 'UPDATE',
        entityType: 'Family',
        entityId: id,
        description: `Updated family: ${updatedFamily.name}`,
        userId,
        ipAddress,
        userAgent,
      });

      return updatedFamily as unknown as Family;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Error updating family: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  async removeFamily(
    id: string,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<boolean> {
    try {
      // Check if family exists
      const family = await this.prisma.family.findUnique({
        where: { id },
      });

      if (!family) {
        throw new NotFoundException(`Family with ID ${id} not found`);
      }

      // Delete all family relationships associated with this family
      await this.prisma.familyRelationship.deleteMany({
        where: { familyId: id },
      });

      // Delete family
      await this.prisma.family.delete({
        where: { id },
      });

      // Log the action
      await this.auditLogService.create({
        action: 'DELETE',
        entityType: 'Family',
        entityId: id,
        description: `Deleted family: ${family.name}`,
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
        `Error removing family: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  async addMemberToFamily(
    familyId: string,
    memberId: string,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<Family> {
    try {
      // Check if family exists
      const family = await this.prisma.family.findUnique({
        where: { id: familyId },
      });

      if (!family) {
        throw new NotFoundException(`Family with ID ${familyId} not found`);
      }

      // Check if member exists
      const member = await this.prisma.member.findUnique({
        where: { id: memberId },
      });

      if (!member) {
        throw new NotFoundException(`Member with ID ${memberId} not found`);
      }

      // Add member to family
      const updatedFamily = await this.prisma.family.update({
        where: { id: familyId },
        data: {
          members: {
            connect: { id: memberId },
          },
        },
        include: {
          members: true,
        },
      });

      // Log the action
      await this.auditLogService.create({
        action: 'ADD_MEMBER_TO_FAMILY',
        entityType: 'Family',
        entityId: familyId,
        description: `Added member ${member.firstName} ${member.lastName} to family ${family.name}`,
        userId,
        ipAddress,
        userAgent,
      });

      return updatedFamily as unknown as Family;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Error adding member to family: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  async removeMemberFromFamily(
    familyId: string,
    memberId: string,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<Family> {
    try {
      // Check if family exists
      const family = await this.prisma.family.findUnique({
        where: { id: familyId },
      });

      if (!family) {
        throw new NotFoundException(`Family with ID ${familyId} not found`);
      }

      // Check if member exists
      const member = await this.prisma.member.findUnique({
        where: { id: memberId },
      });

      if (!member) {
        throw new NotFoundException(`Member with ID ${memberId} not found`);
      }

      // Remove member from family
      const updatedFamily = await this.prisma.family.update({
        where: { id: familyId },
        data: {
          members: {
            disconnect: { id: memberId },
          },
        },
        include: {
          members: true,
        },
      });

      // Delete any family relationships involving this member in this family
      await this.prisma.familyRelationship.deleteMany({
        where: {
          familyId,
          OR: [{ memberId }, { relatedMemberId: memberId }],
        },
      });

      // Log the action
      await this.auditLogService.create({
        action: 'REMOVE_MEMBER_FROM_FAMILY',
        entityType: 'Family',
        entityId: familyId,
        description: `Removed member ${member.firstName} ${member.lastName} from family ${family.name}`,
        userId,
        ipAddress,
        userAgent,
      });

      return updatedFamily as unknown as Family;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Error removing member from family: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  async createFamilyRelationship(
    createFamilyRelationshipInput: CreateFamilyRelationshipInput,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<FamilyRelationship> {
    try {
      // Check if member exists
      const member = await this.prisma.member.findUnique({
        where: { id: createFamilyRelationshipInput.memberId },
      });

      if (!member) {
        throw new NotFoundException(
          `Member with ID ${createFamilyRelationshipInput.memberId} not found`,
        );
      }

      // Check if related member exists
      const relatedMember = await this.prisma.member.findUnique({
        where: { id: createFamilyRelationshipInput.relatedMemberId },
      });

      if (!relatedMember) {
        throw new NotFoundException(
          `Related member with ID ${createFamilyRelationshipInput.relatedMemberId} not found`,
        );
      }

      // Check if family exists if familyId is provided
      if (createFamilyRelationshipInput.familyId) {
        const family = await this.prisma.family.findUnique({
          where: { id: createFamilyRelationshipInput.familyId },
        });

        if (!family) {
          throw new NotFoundException(
            `Family with ID ${createFamilyRelationshipInput.familyId} not found`,
          );
        }
      }

      // Check if relationship already exists
      const existingRelationship =
        await this.prisma.familyRelationship.findFirst({
          where: {
            memberId: createFamilyRelationshipInput.memberId,
            relatedMemberId: createFamilyRelationshipInput.relatedMemberId,
          },
        });

      if (existingRelationship) {
        throw new ConflictException(
          `A relationship already exists between these members`,
        );
      }

      // Create relationship
      const relationship = await this.prisma.familyRelationship.create({
        data: {
          memberId: createFamilyRelationshipInput.memberId,
          relatedMemberId: createFamilyRelationshipInput.relatedMemberId,
          relationshipType:
            createFamilyRelationshipInput.relationshipType as unknown as string,
          familyId: createFamilyRelationshipInput.familyId,
        },
        include: {
          member: true,
          relatedMember: true,
          family: true,
        },
      });

      // Create reciprocal relationship if needed
      if (
        createFamilyRelationshipInput.relationshipType ===
        FamilyRelationshipType.SPOUSE
      ) {
        await this.prisma.familyRelationship.create({
          data: {
            memberId: createFamilyRelationshipInput.relatedMemberId,
            relatedMemberId: createFamilyRelationshipInput.memberId,
            relationshipType:
              FamilyRelationshipType.SPOUSE as unknown as string,
            familyId: createFamilyRelationshipInput.familyId,
          },
        });

        // Update spouse reference in member records
        await this.prisma.member.update({
          where: { id: createFamilyRelationshipInput.memberId },
          data: { spouseId: createFamilyRelationshipInput.relatedMemberId },
        });

        await this.prisma.member.update({
          where: { id: createFamilyRelationshipInput.relatedMemberId },
          data: { spouseId: createFamilyRelationshipInput.memberId },
        });
      } else if (
        createFamilyRelationshipInput.relationshipType ===
        FamilyRelationshipType.PARENT
      ) {
        await this.prisma.familyRelationship.create({
          data: {
            memberId: createFamilyRelationshipInput.relatedMemberId,
            relatedMemberId: createFamilyRelationshipInput.memberId,
            relationshipType: FamilyRelationshipType.CHILD as unknown as string,
            familyId: createFamilyRelationshipInput.familyId,
          },
        });

        // Update parent reference in child record
        await this.prisma.member.update({
          where: { id: createFamilyRelationshipInput.relatedMemberId },
          data: { parentId: createFamilyRelationshipInput.memberId },
        });
      } else if (
        createFamilyRelationshipInput.relationshipType ===
        FamilyRelationshipType.CHILD
      ) {
        await this.prisma.familyRelationship.create({
          data: {
            memberId: createFamilyRelationshipInput.relatedMemberId,
            relatedMemberId: createFamilyRelationshipInput.memberId,
            relationshipType:
              FamilyRelationshipType.PARENT as unknown as string,
            familyId: createFamilyRelationshipInput.familyId,
          },
        });

        // Update parent reference in child record
        await this.prisma.member.update({
          where: { id: createFamilyRelationshipInput.memberId },
          data: { parentId: createFamilyRelationshipInput.relatedMemberId },
        });
      } else if (
        createFamilyRelationshipInput.relationshipType ===
        FamilyRelationshipType.SIBLING
      ) {
        await this.prisma.familyRelationship.create({
          data: {
            memberId: createFamilyRelationshipInput.relatedMemberId,
            relatedMemberId: createFamilyRelationshipInput.memberId,
            relationshipType:
              FamilyRelationshipType.SIBLING as unknown as string,
            familyId: createFamilyRelationshipInput.familyId,
          },
        });
      }

      // Log the action
      await this.auditLogService.create({
        action: 'CREATE',
        entityType: 'FamilyRelationship',
        entityId: relationship.id,
        description: `Created family relationship: ${member.firstName} ${member.lastName} is ${createFamilyRelationshipInput.relationshipType} of ${relatedMember.firstName} ${relatedMember.lastName}`,
        userId,
        ipAddress,
        userAgent,
      });

      return relationship as unknown as FamilyRelationship;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      this.logger.error(
        `Error creating family relationship: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  async findAllFamilyRelationships(
    skip = 0,
    take = 10,
    where?: Prisma.FamilyRelationshipWhereInput,
    orderBy?: Prisma.FamilyRelationshipOrderByWithRelationInput,
  ): Promise<FamilyRelationship[]> {
    try {
      const relationships = await this.prisma.familyRelationship.findMany({
        skip,
        take,
        where,
        orderBy,
        include: {
          member: true,
          relatedMember: true,
          family: true,
        },
      });

      return relationships as unknown as FamilyRelationship[];
    } catch (error) {
      this.logger.error(
        `Error finding family relationships: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  async findFamilyRelationshipById(id: string): Promise<FamilyRelationship> {
    try {
      const relationship = await this.prisma.familyRelationship.findUnique({
        where: { id },
        include: {
          member: true,
          relatedMember: true,
          family: true,
        },
      });

      if (!relationship) {
        throw new NotFoundException(
          `Family relationship with ID ${id} not found`,
        );
      }

      return relationship as unknown as FamilyRelationship;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Error finding family relationship: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  async findFamilyRelationshipsByMember(
    memberId: string,
  ): Promise<FamilyRelationship[]> {
    try {
      const relationships = await this.prisma.familyRelationship.findMany({
        where: { memberId },
        include: {
          member: true,
          relatedMember: true,
          family: true,
        },
      });

      return relationships as unknown as FamilyRelationship[];
    } catch (error) {
      this.logger.error(
        `Error finding family relationships by member: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  async updateFamilyRelationship(
    id: string,
    updateFamilyRelationshipInput: UpdateFamilyRelationshipInput,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<FamilyRelationship> {
    try {
      // Check if relationship exists
      const existingRelationship =
        await this.prisma.familyRelationship.findUnique({
          where: { id },
          include: {
            member: true,
            relatedMember: true,
          },
        });

      if (!existingRelationship) {
        throw new NotFoundException(
          `Family relationship with ID ${id} not found`,
        );
      }

      // Check if members exist if IDs are being updated
      if (updateFamilyRelationshipInput.memberId) {
        const member = await this.prisma.member.findUnique({
          where: { id: updateFamilyRelationshipInput.memberId },
        });

        if (!member) {
          throw new NotFoundException(
            `Member with ID ${updateFamilyRelationshipInput.memberId} not found`,
          );
        }
      }

      if (updateFamilyRelationshipInput.relatedMemberId) {
        const relatedMember = await this.prisma.member.findUnique({
          where: { id: updateFamilyRelationshipInput.relatedMemberId },
        });

        if (!relatedMember) {
          throw new NotFoundException(
            `Related member with ID ${updateFamilyRelationshipInput.relatedMemberId} not found`,
          );
        }
      }

      // Check if family exists if familyId is being updated
      if (updateFamilyRelationshipInput.familyId) {
        const family = await this.prisma.family.findUnique({
          where: { id: updateFamilyRelationshipInput.familyId },
        });

        if (!family) {
          throw new NotFoundException(
            `Family with ID ${updateFamilyRelationshipInput.familyId} not found`,
          );
        }
      }

      // Update relationship
      const updatedRelationship = await this.prisma.familyRelationship.update({
        where: { id },
        data: {
          memberId: updateFamilyRelationshipInput.memberId,
          relatedMemberId: updateFamilyRelationshipInput.relatedMemberId,
          relationshipType:
            updateFamilyRelationshipInput.relationshipType as unknown as string,
          familyId: updateFamilyRelationshipInput.familyId,
        },
        include: {
          member: true,
          relatedMember: true,
          family: true,
        },
      });

      // Log the action
      await this.auditLogService.create({
        action: 'UPDATE',
        entityType: 'FamilyRelationship',
        entityId: id,
        description: `Updated family relationship between ${updatedRelationship.member.firstName} ${updatedRelationship.member.lastName} and ${updatedRelationship.relatedMember.firstName} ${updatedRelationship.relatedMember.lastName}`,
        userId,
        ipAddress,
        userAgent,
      });

      return updatedRelationship as unknown as FamilyRelationship;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Error updating family relationship: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  async removeFamilyRelationship(
    id: string,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<boolean> {
    try {
      // Check if relationship exists
      const relationship = await this.prisma.familyRelationship.findUnique({
        where: { id },
        include: {
          member: true,
          relatedMember: true,
        },
      });

      if (!relationship) {
        throw new NotFoundException(
          `Family relationship with ID ${id} not found`,
        );
      }

      // Find and delete reciprocal relationship if it exists
      const reciprocalRelationship =
        await this.prisma.familyRelationship.findFirst({
          where: {
            memberId: relationship.relatedMemberId,
            relatedMemberId: relationship.memberId,
          },
        });

      if (reciprocalRelationship) {
        await this.prisma.familyRelationship.delete({
          where: { id: reciprocalRelationship.id },
        });
      }

      // Update member records if needed
      if (relationship.relationshipType === 'SPOUSE') {
        await this.prisma.member.update({
          where: { id: relationship.memberId },
          data: { spouseId: null },
        });

        await this.prisma.member.update({
          where: { id: relationship.relatedMemberId },
          data: { spouseId: null },
        });
      } else if (relationship.relationshipType === 'PARENT') {
        await this.prisma.member.update({
          where: { id: relationship.relatedMemberId },
          data: { parentId: null },
        });
      } else if (relationship.relationshipType === 'CHILD') {
        await this.prisma.member.update({
          where: { id: relationship.memberId },
          data: { parentId: null },
        });
      }

      // Delete relationship
      await this.prisma.familyRelationship.delete({
        where: { id },
      });

      // Log the action
      await this.auditLogService.create({
        action: 'DELETE',
        entityType: 'FamilyRelationship',
        entityId: id,
        description: `Deleted family relationship between ${relationship.member.firstName} ${relationship.member.lastName} and ${relationship.relatedMember.firstName} ${relationship.relatedMember.lastName}`,
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
        `Error removing family relationship: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  async addMemberToFamilyByRfidCard(
    rfidCardId: string,
    familyId: string,
    relatedMemberId: string,
    relationship: string,
  ): Promise<Family> {
    // Find the member by RFID card ID
    const member = await this.prisma.member.findUnique({
      where: { rfidCardId },
    });
    if (!member) {
      throw new NotFoundException(
        `Member with RFID card ID ${rfidCardId} not found`,
      );
    }

    // Check if family exists
    const family = await this.prisma.family.findUnique({
      where: { id: familyId },
    });
    if (!family) {
      throw new NotFoundException(`Family with ID ${familyId} not found`);
    }

    // Create the family relationship
    await this.prisma.familyRelationship.create({
      data: {
        familyId,
        memberId: member.id,
        relatedMemberId,
        relationshipType: relationship,
      },
    });

    // Return the updated family with members
    return this.findFamilyById(familyId);
  }

  async countFamilies(where?: Prisma.FamilyWhereInput): Promise<number> {
    try {
      return await this.prisma.family.count({ where });
    } catch (error) {
      this.logger.error(
        `Error counting families: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  async countFamilyRelationships(
    where?: Prisma.FamilyRelationshipWhereInput,
  ): Promise<number> {
    try {
      return await this.prisma.familyRelationship.count({ where });
    } catch (error) {
      this.logger.error(
        `Error counting family relationships: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  /**
   * Finds all families a member belongs to.
   */
  async findFamiliesByMemberId(memberId: string): Promise<Family[]> {
    // Find all family relationships for this member
    const relationships = await this.prisma.familyRelationship.findMany({
      where: { memberId },
      include: { family: true },
    });
    // Extract unique families
    const families = relationships
      .map((rel) => rel.family)
      .filter((fam) => fam != null);
    // Optionally deduplicate by family.id
    const uniqueFamilies = Array.from(
      new Map(families.map((f) => [f.id, f])).values(),
    );
    return uniqueFamilies as Family[];
  }
}
