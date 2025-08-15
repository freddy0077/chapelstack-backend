import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface MemberIdPattern {
  organisationId: string;
  pattern: string;
  enabled: boolean;
}

export interface MemberIdComponents {
  ORG_CODE: string;
  YYYY: string;
  YY: string;
  BRANCH_CODE: string;
  SEQUENCE: string;
}

@Injectable()
export class MemberIdGenerationService {
  private readonly logger = new Logger(MemberIdGenerationService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Generate a unique Member ID for a new member
   */
  async generateMemberId(
    organisationId: string,
    branchId: string,
    membershipYear?: number,
  ): Promise<string> {
    try {
      const year = membershipYear || new Date().getFullYear();

      // Get organization and branch info
      const org = await this.getOrganization(organisationId);
      const branch = await this.getBranch(branchId);

      // Get next sequence number
      const sequence = await this.getNextSequence(
        organisationId,
        branchId,
        year,
      );

      // Get pattern configuration
      const pattern = await this.getPattern(organisationId);

      // Generate ID using configured pattern
      const memberId = this.formatId(pattern, {
        ORG_CODE: org.code || org.name.substring(0, 3).toUpperCase(),
        YYYY: year.toString(),
        YY: year.toString().slice(-2),
        BRANCH_CODE: branch.code || branch.name.substring(0, 3).toUpperCase(),
        SEQUENCE: sequence.toString().padStart(6, '0'),
      });

      // Validate uniqueness
      await this.validateUniqueness(memberId);

      this.logger.log(
        `Generated Member ID: ${memberId} for org: ${organisationId}, branch: ${branchId}`,
      );
      return memberId;
    } catch (error) {
      this.logger.error(`Failed to generate Member ID: ${error.message}`);
      throw new Error(`Failed to generate Member ID: ${error.message}`);
    }
  }

  /**
   * Validate if a Member ID is valid and unique
   */
  async validateMemberId(memberId: string): Promise<boolean> {
    try {
      // Check format (basic validation)
      if (!this.isValidFormat(memberId)) {
        return false;
      }

      // Check uniqueness
      return await this.isUnique(memberId);
    } catch (error) {
      this.logger.error(`Failed to validate Member ID: ${error.message}`);
      return false;
    }
  }

  /**
   * Regenerate Member ID for existing member (for migrations or corrections)
   */
  async regenerateMemberId(
    existingMemberId: string,
    organisationId: string,
    branchId: string,
    membershipYear?: number,
  ): Promise<string> {
    const newMemberId = await this.generateMemberId(
      organisationId,
      branchId,
      membershipYear,
    );

    this.logger.log(
      `Regenerated Member ID: ${existingMemberId} -> ${newMemberId}`,
    );
    return newMemberId;
  }

  /**
   * Get organization information
   */
  private async getOrganization(organisationId: string) {
    const org = await this.prisma.organisation.findUnique({
      where: { id: organisationId },
      select: { id: true, name: true },
    });

    if (!org) {
      throw new Error(`Organization not found: ${organisationId}`);
    }

    return {
      ...org,
      code: org.name.substring(0, 3).toUpperCase(), // Generate code from name if not available
    };
  }

  /**
   * Get branch information
   */
  private async getBranch(branchId: string) {
    const branch = await this.prisma.branch.findUnique({
      where: { id: branchId },
      select: { id: true, name: true },
    });

    if (!branch) {
      throw new Error(`Branch not found: ${branchId}`);
    }

    return {
      ...branch,
      code: branch.name.substring(0, 3).toUpperCase(), // Generate code from name if not available
    };
  }

  /**
   * Get next sequence number for the organization/branch/year
   */
  private async getNextSequence(
    organisationId: string,
    branchId: string,
    year: number,
  ): Promise<number> {
    // For now, we'll use a simple approach with the existing database
    // In the future, this can be replaced with the dedicated sequence tables

    // Count existing members for this org/branch/year to get next sequence
    const existingCount = await this.prisma.member.count({
      where: {
        organisationId,
        branchId,
        membershipDate: {
          gte: new Date(year, 0, 1),
          lt: new Date(year + 1, 0, 1),
        },
      },
    });

    return existingCount + 1;
  }

  /**
   * Get ID pattern configuration for organization
   */
  private async getPattern(organisationId: string): Promise<string> {
    // For now, return default pattern
    // In the future, this will query the MemberIdConfig table
    return '{ORG_CODE}-{YYYY}-{BRANCH_CODE}-{SEQUENCE}';
  }

  /**
   * Format ID using pattern and components
   */
  private formatId(pattern: string, components: MemberIdComponents): string {
    let formatted = pattern;

    // Replace pattern variables
    Object.entries(components).forEach(([key, value]) => {
      const regex = new RegExp(`\\{${key}(?::(\\d+))?\\}`, 'g');
      formatted = formatted.replace(regex, (match, padding) => {
        if (padding && key === 'SEQUENCE') {
          return value.padStart(parseInt(padding), '0');
        }
        return value;
      });
    });

    return formatted;
  }

  /**
   * Basic format validation
   */
  private isValidFormat(memberId: string): boolean {
    // Basic validation - should contain alphanumeric characters and hyphens
    return (
      /^[A-Z0-9-]+$/.test(memberId) &&
      memberId.length >= 8 &&
      memberId.length <= 50
    );
  }

  /**
   * Check if Member ID is unique
   */
  private async isUnique(memberId: string): Promise<boolean> {
    const existing = await this.prisma.member.findFirst({
      where: { memberId },
      select: { id: true },
    });

    return !existing;
  }

  /**
   * Validate uniqueness and throw error if not unique
   */
  private async validateUniqueness(memberId: string): Promise<void> {
    const isUnique = await this.isUnique(memberId);
    if (!isUnique) {
      throw new Error(`Member ID already exists: ${memberId}`);
    }
  }

  /**
   * Bulk generate Member IDs for existing members (migration utility)
   */
  async bulkGenerateMemberIds(
    organisationId: string,
  ): Promise<{ success: number; failed: number; errors: string[] }> {
    const results: { success: number; failed: number; errors: string[] } = {
      success: 0,
      failed: 0,
      errors: [],
    };

    try {
      // Get all members without Member IDs
      const members = await this.prisma.member.findMany({
        where: {
          organisationId,
          OR: [{ memberId: null }, { memberId: '' }],
        },
        select: {
          id: true,
          branchId: true,
          membershipDate: true,
          firstName: true,
          lastName: true,
        },
      });

      this.logger.log(`Found ${members.length} members without Member IDs`);

      for (const member of members) {
        try {
          const membershipYear = member.membershipDate
            ? new Date(member.membershipDate).getFullYear()
            : new Date().getFullYear();

          const memberId = await this.generateMemberId(
            organisationId,
            member.branchId || '',
            membershipYear,
          );

          await this.prisma.member.update({
            where: { id: member.id },
            data: {
              memberId,
              memberIdGeneratedAt: new Date(),
            },
          });

          results.success++;
          this.logger.log(
            `Generated Member ID for ${member.firstName} ${member.lastName}: ${memberId}`,
          );
        } catch (error) {
          results.failed++;
          const errorMsg = `Failed to generate ID for member ${member.id}: ${error.message}`;
          results.errors.push(errorMsg);
          this.logger.error(errorMsg);
        }
      }

      this.logger.log(
        `Bulk generation complete: ${results.success} success, ${results.failed} failed`,
      );
      return results;
    } catch (error) {
      this.logger.error(`Bulk generation failed: ${error.message}`);
      throw error;
    }
  }
}
