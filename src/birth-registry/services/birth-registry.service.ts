import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit/services/audit-log.service';
import { MembersService } from '../../members/services/members.service';
import { FamiliesService } from '../../members/services/families.service';
import { FamilyRelationshipType } from '../../members/entities/family.entity';
import {
  CreateBirthRegistryInput,
  UpdateBirthRegistryInput,
  BirthRegistryFiltersInput,
  UploadDocumentInput,
} from '../dto/birth-registry.input';
import {
  BirthRegistry,
  BirthRegistryStats,
  BirthRegistryCalendarEntry,
  ParentMember,
} from '../entities/birth-registry.entity';

@Injectable()
export class BirthRegistryService {
  private readonly logger = new Logger(BirthRegistryService.name);

  constructor(
    private prisma: PrismaService,
    private auditLogService: AuditLogService,
    private membersService: MembersService,
    private familiesService: FamiliesService,
  ) {}

  async create(
    createBirthRegistryInput: CreateBirthRegistryInput,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<BirthRegistry> {
    try {
      // Validate that the organization exists
      const organization = await this.prisma.organisation.findUnique({
        where: { id: createBirthRegistryInput.organisationId },
      });
      if (!organization) {
        throw new NotFoundException(
          `Organization with ID ${createBirthRegistryInput.organisationId} not found`,
        );
      }

      // Validate branch if provided
      if (createBirthRegistryInput.branchId) {
        const branch = await this.prisma.branch.findUnique({
          where: { id: createBirthRegistryInput.branchId },
        });
        if (!branch) {
          throw new NotFoundException(
            `Branch with ID ${createBirthRegistryInput.branchId} not found`,
          );
        }
      }

      // Validate mother member if provided
      if (createBirthRegistryInput.motherMemberId) {
        const motherMember = await this.prisma.member.findUnique({
          where: { id: createBirthRegistryInput.motherMemberId },
        });
        if (!motherMember) {
          throw new NotFoundException(
            `Mother member with ID ${createBirthRegistryInput.motherMemberId} not found`,
          );
        }
      }

      // Validate father member if provided
      if (createBirthRegistryInput.fatherMemberId) {
        const fatherMember = await this.prisma.member.findUnique({
          where: { id: createBirthRegistryInput.fatherMemberId },
        });
        if (!fatherMember) {
          throw new NotFoundException(
            `Father member with ID ${createBirthRegistryInput.fatherMemberId} not found`,
          );
        }
      }

      // Validate baptism event if provided
      if (createBirthRegistryInput.baptismEventId) {
        const baptismEvent = await this.prisma.event.findUnique({
          where: { id: createBirthRegistryInput.baptismEventId },
        });
        if (!baptismEvent) {
          throw new NotFoundException(
            `Baptism event with ID ${createBirthRegistryInput.baptismEventId} not found`,
          );
        }
      }

      // Validate baptism date is after birth date
      if (createBirthRegistryInput.baptismDate) {
        const birthDate = new Date(createBirthRegistryInput.dateOfBirth);
        const baptismDate = new Date(createBirthRegistryInput.baptismDate);
        if (baptismDate <= birthDate) {
          throw new BadRequestException(
            'Baptism date must be after birth date',
          );
        }
      }

      // Create child member if requested
      let childMemberId: string | undefined;
      if (createBirthRegistryInput.createChildMember) {
        const childMemberInput = {
          firstName: createBirthRegistryInput.childFirstName,
          middleName: createBirthRegistryInput.childMiddleName,
          lastName: createBirthRegistryInput.childLastName,
          gender: createBirthRegistryInput.childGender,
          dateOfBirth: new Date(createBirthRegistryInput.dateOfBirth),
          membershipStatus: 'INFANT' as any,
          membershipDate: new Date(),
          address: createBirthRegistryInput.parentAddress,
          phoneNumber: createBirthRegistryInput.parentPhone,
          email: createBirthRegistryInput.parentEmail,
          organisationId: createBirthRegistryInput.organisationId,
          branchId: createBirthRegistryInput.branchId,
          // Link to primary parent (mother if available, otherwise father)
          parentId:
            createBirthRegistryInput.motherMemberId ||
            createBirthRegistryInput.fatherMemberId,
        };

        const childMember = await this.membersService.create(
          childMemberInput,
          userId,
          ipAddress,
          userAgent,
        );
        childMemberId = childMember.id;
      }

      const birthRegistry = await this.prisma.birthRegistry.create({
        data: {
          childFirstName: createBirthRegistryInput.childFirstName,
          childMiddleName: createBirthRegistryInput.childMiddleName,
          childLastName: createBirthRegistryInput.childLastName,
          childGender: createBirthRegistryInput.childGender,
          dateOfBirth: new Date(createBirthRegistryInput.dateOfBirth),
          timeOfBirth: createBirthRegistryInput.timeOfBirth,
          placeOfBirth: createBirthRegistryInput.placeOfBirth,
          hospitalName: createBirthRegistryInput.hospitalName,
          attendingPhysician: createBirthRegistryInput.attendingPhysician,
          birthWeight: createBirthRegistryInput.birthWeight,
          birthLength: createBirthRegistryInput.birthLength,
          birthCircumstances: createBirthRegistryInput.birthCircumstances,
          complications: createBirthRegistryInput.complications,
          motherFirstName: createBirthRegistryInput.motherFirstName,
          motherLastName: createBirthRegistryInput.motherLastName,
          motherMemberId: createBirthRegistryInput.motherMemberId,
          motherAge: createBirthRegistryInput.motherAge,
          motherOccupation: createBirthRegistryInput.motherOccupation,
          fatherFirstName: createBirthRegistryInput.fatherFirstName,
          fatherLastName: createBirthRegistryInput.fatherLastName,
          fatherMemberId: createBirthRegistryInput.fatherMemberId,
          fatherAge: createBirthRegistryInput.fatherAge,
          fatherOccupation: createBirthRegistryInput.fatherOccupation,
          parentAddress: createBirthRegistryInput.parentAddress,
          parentPhone: createBirthRegistryInput.parentPhone,
          parentEmail: createBirthRegistryInput.parentEmail,
          baptismPlanned: createBirthRegistryInput.baptismPlanned,
          baptismDate: createBirthRegistryInput.baptismDate
            ? new Date(createBirthRegistryInput.baptismDate)
            : null,
          baptismLocation: createBirthRegistryInput.baptismLocation,
          baptismOfficiant: createBirthRegistryInput.baptismOfficiant,
          baptismEventId: createBirthRegistryInput.baptismEventId,
          createChildMember: createBirthRegistryInput.createChildMember,
          childMemberId: childMemberId,
          birthCertificateUrl: createBirthRegistryInput.birthCertificateUrl,
          hospitalRecordUrl: createBirthRegistryInput.hospitalRecordUrl,
          photoUrls: createBirthRegistryInput.photoUrls || [],
          additionalDocuments: createBirthRegistryInput.additionalDocuments
            ? JSON.stringify(createBirthRegistryInput.additionalDocuments)
            : undefined,
          createdById: userId,
          branchId: createBirthRegistryInput.branchId,
          organisationId: createBirthRegistryInput.organisationId,
        },
        include: {
          childMember: true,
          motherMember: true,
          fatherMember: true,
          branch: true,
          organisation: true,
          baptismEvent: true,
          createdBy: true,
          updatedBy: true,
        },
      });

      // Create comprehensive family relationships if child member was created
      if (
        childMemberId &&
        (createBirthRegistryInput.motherMemberId ||
          createBirthRegistryInput.fatherMemberId)
      ) {
        await this.createFamilyRelationships(
          childMemberId,
          createBirthRegistryInput.motherMemberId,
          createBirthRegistryInput.fatherMemberId,
          userId,
          ipAddress,
          userAgent,
        );
      }

      // Log audit action
      await this.auditLogService.create({
        action: 'CREATE',
        entityType: 'BirthRegistry',
        entityId: birthRegistry.id,
        description: `Created birth record for ${birthRegistry.childFirstName} ${birthRegistry.childLastName}`,
        userId,
        ipAddress,
        userAgent,
      });

      return birthRegistry as unknown as BirthRegistry;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(
        `Error creating birth registry: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  /**
   * Create comprehensive family relationships when a birth registry record is created
   * This establishes parent-child, sibling, and spouse relationships in the FamilyRelationship model
   */
  private async createFamilyRelationships(
    childMemberId: string,
    motherMemberId?: string,
    fatherMemberId?: string,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    try {
      this.logger.log(
        `Creating family relationships for child ${childMemberId}`,
      );

      // 1. Create parent-child relationships
      if (motherMemberId) {
        // Child -> Mother relationship
        await this.familiesService.createFamilyRelationship(
          {
            memberId: childMemberId,
            relatedMemberId: motherMemberId,
            relationshipType: FamilyRelationshipType.PARENT,
          },
          userId,
          ipAddress,
          userAgent,
        );
        this.logger.log(
          `Created child-mother relationship: ${childMemberId} -> ${motherMemberId}`,
        );
      }

      if (fatherMemberId) {
        // Child -> Father relationship
        await this.familiesService.createFamilyRelationship(
          {
            memberId: childMemberId,
            relatedMemberId: fatherMemberId,
            relationshipType: FamilyRelationshipType.PARENT,
          },
          userId,
          ipAddress,
          userAgent,
        );
        this.logger.log(
          `Created child-father relationship: ${childMemberId} -> ${fatherMemberId}`,
        );
      }

      // 2. Create spouse relationship between parents if both exist
      if (motherMemberId && fatherMemberId) {
        // Check if spouse relationship already exists
        const existingSpouseRelationship =
          await this.prisma.familyRelationship.findFirst({
            where: {
              OR: [
                {
                  memberId: motherMemberId,
                  relatedMemberId: fatherMemberId,
                  relationshipType: FamilyRelationshipType.SPOUSE,
                },
                {
                  memberId: fatherMemberId,
                  relatedMemberId: motherMemberId,
                  relationshipType: FamilyRelationshipType.SPOUSE,
                },
              ],
            },
          });

        if (!existingSpouseRelationship) {
          await this.familiesService.createFamilyRelationship(
            {
              memberId: motherMemberId,
              relatedMemberId: fatherMemberId,
              relationshipType: FamilyRelationshipType.SPOUSE,
            },
            userId,
            ipAddress,
            userAgent,
          );
          this.logger.log(
            `Created spouse relationship: ${motherMemberId} <-> ${fatherMemberId}`,
          );
        }
      }

      // 3. Create sibling relationships with existing children of the same parents
      await this.createSiblingRelationships(
        childMemberId,
        motherMemberId,
        fatherMemberId,
        userId,
        ipAddress,
        userAgent,
      );
    } catch (error) {
      this.logger.error(
        `Error creating family relationships for child ${childMemberId}: ${(error as Error).message}`,
        (error as Error).stack,
      );
      // Don't throw error to prevent birth registry creation from failing
      // Family relationships are supplementary and can be created manually if needed
    }
  }

  /**
   * Create sibling relationships between the new child and existing children of the same parents
   */
  private async createSiblingRelationships(
    childMemberId: string,
    motherMemberId?: string,
    fatherMemberId?: string,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    try {
      // Find existing children of the same parents
      const existingSiblings = await this.prisma.birthRegistry.findMany({
        where: {
          AND: [
            { childMemberId: { not: null } },
            { childMemberId: { not: childMemberId } }, // Exclude the current child
            {
              OR: [
                motherMemberId ? { motherMemberId } : {},
                fatherMemberId ? { fatherMemberId } : {},
              ].filter((condition) => Object.keys(condition).length > 0),
            },
          ],
        },
        select: {
          childMemberId: true,
          childFirstName: true,
          childLastName: true,
        },
      });

      // Create sibling relationships
      for (const sibling of existingSiblings) {
        if (sibling.childMemberId) {
          // Create bidirectional sibling relationship
          await this.familiesService.createFamilyRelationship(
            {
              memberId: childMemberId,
              relatedMemberId: sibling.childMemberId,
              relationshipType: FamilyRelationshipType.SIBLING,
            },
            userId,
            ipAddress,
            userAgent,
          );

          this.logger.log(
            `Created sibling relationship: ${childMemberId} <-> ${sibling.childMemberId} (${sibling.childFirstName} ${sibling.childLastName})`,
          );
        }
      }

      if (existingSiblings.length > 0) {
        this.logger.log(
          `Created ${existingSiblings.length} sibling relationships for child ${childMemberId}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Error creating sibling relationships for child ${childMemberId}: ${(error as Error).message}`,
        (error as Error).stack,
      );
    }
  }

  async findAll(
    organisationId: string,
    branchId?: string,
    filters?: BirthRegistryFiltersInput,
  ): Promise<BirthRegistry[]> {
    try {
      const where: any = {
        organisationId,
        ...(branchId && { branchId }),
      };

      // Apply filters
      if (filters) {
        if (filters.search) {
          where.OR = [
            {
              childFirstName: { contains: filters.search, mode: 'insensitive' },
            },
            {
              childLastName: { contains: filters.search, mode: 'insensitive' },
            },
            {
              motherFirstName: {
                contains: filters.search,
                mode: 'insensitive',
              },
            },
            {
              motherLastName: { contains: filters.search, mode: 'insensitive' },
            },
            {
              fatherFirstName: {
                contains: filters.search,
                mode: 'insensitive',
              },
            },
            {
              fatherLastName: { contains: filters.search, mode: 'insensitive' },
            },
            { placeOfBirth: { contains: filters.search, mode: 'insensitive' } },
            { hospitalName: { contains: filters.search, mode: 'insensitive' } },
          ];
        }

        if (filters.gender) {
          where.childGender = filters.gender;
        }

        if (filters.dateFrom || filters.dateTo) {
          where.dateOfBirth = {};
          if (filters.dateFrom) {
            where.dateOfBirth.gte = new Date(filters.dateFrom);
          }
          if (filters.dateTo) {
            where.dateOfBirth.lte = new Date(filters.dateTo);
          }
        }

        if (filters.baptismPlanned !== undefined) {
          where.baptismPlanned = filters.baptismPlanned;
        }

        if (filters.placeOfBirth) {
          where.placeOfBirth = {
            contains: filters.placeOfBirth,
            mode: 'insensitive',
          };
        }

        if (filters.branchId) {
          where.branchId = filters.branchId;
        }
      }

      const birthRegistries = await this.prisma.birthRegistry.findMany({
        where,
        include: {
          childMember: true,
          motherMember: true,
          fatherMember: true,
          branch: true,
          organisation: true,
          baptismEvent: true,
          createdBy: true,
          updatedBy: true,
        },
        orderBy: { dateOfBirth: 'desc' },
        skip: filters?.skip || 0,
        take: filters?.take || 50,
      });

      return birthRegistries as unknown as BirthRegistry[];
    } catch (error) {
      this.logger.error(
        `Error fetching birth registries: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  async findOne(id: string): Promise<BirthRegistry> {
    try {
      const birthRegistry = await this.prisma.birthRegistry.findUnique({
        where: { id },
        include: {
          childMember: true,
          motherMember: true,
          fatherMember: true,
          branch: true,
          organisation: true,
          baptismEvent: true,
          createdBy: true,
          updatedBy: true,
        },
      });

      if (!birthRegistry) {
        throw new NotFoundException(`Birth registry with ID ${id} not found`);
      }

      return birthRegistry as unknown as BirthRegistry;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Error fetching birth registry: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  async update(
    id: string,
    updateBirthRegistryInput: UpdateBirthRegistryInput,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<BirthRegistry> {
    try {
      // Check if birth registry exists
      const existingBirthRegistry = await this.prisma.birthRegistry.findUnique({
        where: { id },
      });

      if (!existingBirthRegistry) {
        throw new NotFoundException(`Birth registry with ID ${id} not found`);
      }

      // Validate mother member if provided
      if (updateBirthRegistryInput.motherMemberId) {
        const motherMember = await this.prisma.member.findUnique({
          where: { id: updateBirthRegistryInput.motherMemberId },
        });
        if (!motherMember) {
          throw new NotFoundException(
            `Mother member with ID ${updateBirthRegistryInput.motherMemberId} not found`,
          );
        }
      }

      // Validate father member if provided
      if (updateBirthRegistryInput.fatherMemberId) {
        const fatherMember = await this.prisma.member.findUnique({
          where: { id: updateBirthRegistryInput.fatherMemberId },
        });
        if (!fatherMember) {
          throw new NotFoundException(
            `Father member with ID ${updateBirthRegistryInput.fatherMemberId} not found`,
          );
        }
      }

      // Validate baptism event if provided
      if (updateBirthRegistryInput.baptismEventId) {
        const baptismEvent = await this.prisma.event.findUnique({
          where: { id: updateBirthRegistryInput.baptismEventId },
        });
        if (!baptismEvent) {
          throw new NotFoundException(
            `Baptism event with ID ${updateBirthRegistryInput.baptismEventId} not found`,
          );
        }
      }

      // Validate baptism date is after birth date
      if (updateBirthRegistryInput.baptismDate) {
        const birthDate = updateBirthRegistryInput.dateOfBirth
          ? new Date(updateBirthRegistryInput.dateOfBirth)
          : existingBirthRegistry.dateOfBirth;
        const baptismDate = new Date(updateBirthRegistryInput.baptismDate);
        if (baptismDate <= birthDate) {
          throw new BadRequestException(
            'Baptism date must be after birth date',
          );
        }
      }

      const updateData: any = {
        ...updateBirthRegistryInput,
        updatedById: userId,
      };

      // Convert date strings to Date objects
      if (updateBirthRegistryInput.dateOfBirth) {
        updateData.dateOfBirth = new Date(updateBirthRegistryInput.dateOfBirth);
      }
      if (updateBirthRegistryInput.baptismDate) {
        updateData.baptismDate = new Date(updateBirthRegistryInput.baptismDate);
      }

      const birthRegistry = await this.prisma.birthRegistry.update({
        where: { id },
        data: updateData,
        include: {
          childMember: true,
          motherMember: true,
          fatherMember: true,
          branch: true,
          organisation: true,
          baptismEvent: true,
          createdBy: true,
          updatedBy: true,
        },
      });

      // Log audit action
      await this.auditLogService.create({
        action: 'UPDATE',
        entityType: 'BirthRegistry',
        entityId: birthRegistry.id,
        description: `Updated birth record for ${birthRegistry.childFirstName} ${birthRegistry.childLastName}`,
        userId,
        ipAddress,
        userAgent,
      });

      return birthRegistry as unknown as BirthRegistry;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(
        `Error updating birth registry: ${(error as Error).message}`,
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
      const birthRegistry = await this.prisma.birthRegistry.findUnique({
        where: { id },
      });

      if (!birthRegistry) {
        throw new NotFoundException(`Birth registry with ID ${id} not found`);
      }

      await this.prisma.birthRegistry.delete({
        where: { id },
      });

      // Log audit action
      await this.auditLogService.create({
        action: 'DELETE',
        entityType: 'BirthRegistry',
        entityId: id,
        description: `Deleted birth record for ${birthRegistry.childFirstName} ${birthRegistry.childLastName}`,
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
        `Error deleting birth registry: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  async getStatistics(
    organisationId: string,
    branchId?: string,
  ): Promise<BirthRegistryStats> {
    try {
      const where: any = {
        organisationId,
        ...(branchId && { branchId }),
      };

      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth();

      const [
        total,
        thisYear,
        thisMonth,
        maleCount,
        femaleCount,
        baptismPlannedCount,
        baptismCompletedCount,
        avgBirthWeight,
        hospitalBirths,
        homeBirths,
      ] = await Promise.all([
        this.prisma.birthRegistry.count({ where }),
        this.prisma.birthRegistry.count({
          where: {
            ...where,
            dateOfBirth: {
              gte: new Date(currentYear, 0, 1),
              lt: new Date(currentYear + 1, 0, 1),
            },
          },
        }),
        this.prisma.birthRegistry.count({
          where: {
            ...where,
            dateOfBirth: {
              gte: new Date(currentYear, currentMonth, 1),
              lt: new Date(currentYear, currentMonth + 1, 1),
            },
          },
        }),
        this.prisma.birthRegistry.count({
          where: { ...where, childGender: 'MALE' },
        }),
        this.prisma.birthRegistry.count({
          where: { ...where, childGender: 'FEMALE' },
        }),
        this.prisma.birthRegistry.count({
          where: { ...where, baptismPlanned: true },
        }),
        this.prisma.birthRegistry.count({
          where: { ...where, baptismDate: { not: null } },
        }),
        this.prisma.birthRegistry.aggregate({
          where: { ...where, birthWeight: { not: null } },
          _avg: { birthWeight: true },
        }),
        this.prisma.birthRegistry.count({
          where: { ...where, hospitalName: { not: null } },
        }),
        this.prisma.birthRegistry.count({
          where: { ...where, hospitalName: null },
        }),
      ]);

      return {
        total,
        thisYear,
        thisMonth,
        maleCount,
        femaleCount,
        baptismPlannedCount,
        baptismCompletedCount,
        averageBirthWeight: avgBirthWeight._avg.birthWeight || 0,
        hospitalBirthsCount: hospitalBirths,
        homeBirthsCount: homeBirths,
      };
    } catch (error) {
      this.logger.error(
        `Error getting birth registry statistics: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  async getCalendarEntries(
    organisationId: string,
    branchId?: string,
    month?: number,
    year?: number,
  ): Promise<BirthRegistryCalendarEntry[]> {
    try {
      const currentDate = new Date();
      // Convert 1-based month from frontend to 0-based month for JavaScript Date
      const targetMonth =
        month !== undefined ? month - 1 : currentDate.getMonth();
      const targetYear = year !== undefined ? year : currentDate.getFullYear();

      const startDate = new Date(targetYear, targetMonth, 1);
      const endDate = new Date(targetYear, targetMonth + 1, 0);

      const where: any = {
        organisationId,
        ...(branchId && { branchId }),
        dateOfBirth: {
          gte: startDate,
          lte: endDate,
        },
      };

      const birthRegistries = await this.prisma.birthRegistry.findMany({
        where,
        select: {
          id: true,
          childFirstName: true,
          childLastName: true,
          dateOfBirth: true,
          baptismPlanned: true,
          baptismDate: true,
          photoUrls: true,
        },
        orderBy: { dateOfBirth: 'asc' },
      });

      return birthRegistries.map((registry) => ({
        id: registry.id,
        childName:
          registry.childFirstName +
          (registry.childLastName ? ' ' + registry.childLastName : ''),
        dateOfBirth: registry.dateOfBirth,
        photoUrl:
          registry.photoUrls.length > 0 ? registry.photoUrls[0] : undefined,
        daysOld: Math.ceil(
          (currentDate.getTime() - registry.dateOfBirth.getTime()) /
            (1000 * 60 * 60 * 24),
        ),
        baptismPlanned: registry.baptismPlanned,
        baptismDate:
          registry.baptismDate === null ? undefined : registry.baptismDate,
      }));
    } catch (error) {
      this.logger.error(
        `Error getting birth registry calendar entries: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  async searchMembersForParents(
    organisationId: string,
    branchId: string,
    query: string,
    skip = 0,
    take = 10,
  ): Promise<ParentMember[]> {
    try {
      const members = await this.prisma.member.findMany({
        where: {
          organisationId,
          branchId,
          OR: [
            { firstName: { contains: query, mode: 'insensitive' } },
            { lastName: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phoneNumber: true,
          profileImageUrl: true,
        },
        skip,
        take,
        orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
      });

      return members.map((member) => ({
        id: member.id,
        firstName: member.firstName,
        lastName: member.lastName,
        email: member.email === null ? undefined : member.email,
        phoneNumber:
          member.phoneNumber === null ? undefined : member.phoneNumber,
        profileImageUrl:
          member.profileImageUrl === null ? undefined : member.profileImageUrl,
      }));
    } catch (error) {
      this.logger.error(
        `Error searching members for parents: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  async uploadDocument(
    uploadDocumentInput: UploadDocumentInput,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<BirthRegistry> {
    try {
      const birthRegistry = await this.prisma.birthRegistry.findUnique({
        where: { id: uploadDocumentInput.birthRegistryId },
      });

      if (!birthRegistry) {
        throw new NotFoundException(
          `Birth registry with ID ${uploadDocumentInput.birthRegistryId} not found`,
        );
      }

      let updateData: any = {};

      switch (uploadDocumentInput.documentType) {
        case 'birth_certificate':
          updateData.birthCertificateUrl = uploadDocumentInput.documentUrl;
          break;
        case 'hospital_record':
          updateData.hospitalRecordUrl = uploadDocumentInput.documentUrl;
          break;
        case 'photo':
          updateData.photoUrls = [
            ...birthRegistry.photoUrls,
            uploadDocumentInput.documentUrl,
          ];
          break;
        case 'additional':
          const newDocument = {
            name: uploadDocumentInput.documentName || 'Additional Document',
            url: uploadDocumentInput.documentUrl,
            type: uploadDocumentInput.documentType,
          };
          let docs: any[];
          if (Array.isArray(birthRegistry.additionalDocuments)) {
            docs = birthRegistry.additionalDocuments;
          } else if (typeof birthRegistry.additionalDocuments === 'string') {
            try {
              docs = JSON.parse(birthRegistry.additionalDocuments);
            } catch {
              docs = [];
            }
          } else {
            docs = [];
          }
          updateData.additionalDocuments = [...docs, newDocument];
          break;
        default:
          throw new BadRequestException(
            `Invalid document type: ${uploadDocumentInput.documentType}`,
          );
      }

      const updatedBirthRegistry = await this.prisma.birthRegistry.update({
        where: { id: uploadDocumentInput.birthRegistryId },
        data: {
          ...updateData,
          updatedById: userId,
        },
        include: {
          motherMember: true,
          fatherMember: true,
          branch: true,
          organisation: true,
          baptismEvent: true,
          createdBy: true,
          updatedBy: true,
        },
      });

      // Log audit action
      await this.auditLogService.create({
        action: 'UPDATE',
        entityType: 'BirthRegistry',
        entityId: updatedBirthRegistry.id,
        description: `Uploaded ${uploadDocumentInput.documentType} document for ${updatedBirthRegistry.childFirstName} ${updatedBirthRegistry.childLastName}`,
        userId,
        ipAddress,
        userAgent,
      });

      return updatedBirthRegistry as unknown as BirthRegistry;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(
        `Error uploading document: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }
}
