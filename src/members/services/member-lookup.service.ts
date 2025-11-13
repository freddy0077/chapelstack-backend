import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LoggerService } from '../../common/services/logger.service';

/**
 * MemberLookupService
 * Provides member lookup functionality for registration and user linking
 * Used to find members by email and validate if they can be linked to users
 */
@Injectable()
export class MemberLookupService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Find a member by email within an organization
   * @param email - Member email address
   * @param organisationId - Organization ID to scope the search
   * @returns Member record if found, null otherwise
   */
  async findMemberByEmail(email: string, organisationId: string) {
    try {
      const member = await this.prisma.member.findFirst({
        where: {
          email: email.toLowerCase(),
          organisationId,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          userId: true,
          status: true,
          organisationId: true,
        },
      });

      if (member) {
        this.logger.log(
          `Member found by email: ${email} in organisation: ${organisationId}`,
          'MemberLookupService',
        );
      }

      return member;
    } catch (error) {
      this.logger.error(
        `Error finding member by email: ${email}`,
        error,
        'MemberLookupService',
      );
      throw error;
    }
  }

  /**
   * Check if a member can be linked to a user
   * A member can be linked if:
   * 1. Member exists in the database
   * 2. Member is not already linked to a user
   * 3. Member is in the same organization
   *
   * @param email - Member email address
   * @param organisationId - Organization ID
   * @returns true if member can be linked, false otherwise
   */
  async canLinkMember(email: string, organisationId: string): Promise<boolean> {
    try {
      const member = await this.findMemberByEmail(email, organisationId);

      if (!member) {
        this.logger.debug(
          `Member not found for email: ${email}`,
          'MemberLookupService',
        );
        return false;
      }

      if (member.userId) {
        this.logger.warn(
          `Member already linked to user: ${member.userId} for email: ${email}`,
          'MemberLookupService',
        );
        return false;
      }

      this.logger.log(
        `Member can be linked: ${email}`,
        'MemberLookupService',
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Error checking if member can be linked: ${email}`,
        error,
        'MemberLookupService',
      );
      throw error;
    }
  }

  /**
   * Get member information for linking
   * Returns member details without exposing sensitive data
   * Used to display member info during registration
   *
   * @param email - Member email address
   * @param organisationId - Organization ID
   * @returns Member info object or null if not found
   */
  async getMemberInfoForLinking(email: string, organisationId: string) {
    try {
      const member = await this.findMemberByEmail(email, organisationId);

      if (!member) {
        return null;
      }

      return {
        id: member.id,
        firstName: member.firstName,
        lastName: member.lastName,
        email: member.email,
        status: member.status,
        canLink: !member.userId, // Can link if no user assigned
      };
    } catch (error) {
      this.logger.error(
        `Error getting member info for linking: ${email}`,
        error,
        'MemberLookupService',
      );
      throw error;
    }
  }

  /**
   * Link a user to a member
   * Updates the member record with the user ID
   *
   * @param memberId - Member ID to link
   * @param userId - User ID to link to member
   * @returns Updated member record
   */
  async linkUserToMember(memberId: string, userId: string) {
    try {
      const member = await this.prisma.member.update({
        where: { id: memberId },
        data: { userId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          userId: true,
          status: true,
        },
      });

      this.logger.log(
        `User ${userId} linked to member ${memberId}`,
        'MemberLookupService',
      );

      return member;
    } catch (error) {
      this.logger.error(
        `Error linking user ${userId} to member ${memberId}`,
        error,
        'MemberLookupService',
      );
      throw error;
    }
  }

  /**
   * Get member by ID
   * @param memberId - Member ID
   * @returns Member record if found
   */
  async getMemberById(memberId: string) {
    try {
      const member = await this.prisma.member.findUnique({
        where: { id: memberId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          userId: true,
          status: true,
          organisationId: true,
        },
      });

      if (!member) {
        throw new NotFoundException(`Member not found: ${memberId}`);
      }

      return member;
    } catch (error) {
      this.logger.error(
        `Error getting member by ID: ${memberId}`,
        error,
        'MemberLookupService',
      );
      throw error;
    }
  }

  /**
   * Check if member exists by email in organization
   * @param email - Member email
   * @param organisationId - Organization ID
   * @returns true if member exists, false otherwise
   */
  async memberExists(email: string, organisationId: string): Promise<boolean> {
    try {
      const member = await this.findMemberByEmail(email, organisationId);
      return !!member;
    } catch (error) {
      this.logger.error(
        `Error checking if member exists: ${email}`,
        error,
        'MemberLookupService',
      );
      throw error;
    }
  }
}
