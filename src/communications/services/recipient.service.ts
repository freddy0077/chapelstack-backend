import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  MemberFilterInput,
  BirthdayRangeEnum,
} from '../dto/member-filter.input';

@Injectable()
export class RecipientService {
  constructor(private prisma: PrismaService) {}

  async getRecipientGroups() {
    const ministries = await this.prisma.ministry.findMany({
      select: { id: true, name: true },
    });
    const smallGroups = await this.prisma.smallGroup.findMany({
      select: { id: true, name: true },
    });
    return [
      ...ministries.map((m) => ({ ...m, type: 'MINISTRY' })),
      ...smallGroups.map((g) => ({ ...g, type: 'SMALL_GROUP' })),
    ];
  }

  async getFilteredMembers(filter: MemberFilterInput) {
    const where: any = {};
    if (filter?.groupId) {
      where.groupMemberships = {
        some: {
          OR: [
            { ministryId: filter.groupId },
            { smallGroupId: filter.groupId },
          ],
        },
      };
    }
    if (filter?.branchId) where.branchId = filter.branchId;
    if (filter?.role) where.role = filter.role;
    if (filter?.status) where.status = filter.status;
    if (filter?.gender) where.gender = filter.gender;
    if (filter?.search) {
      where.OR = [
        { firstName: { contains: filter.search, mode: 'insensitive' } },
        { lastName: { contains: filter.search, mode: 'insensitive' } },
        { email: { contains: filter.search, mode: 'insensitive' } },
        { phoneNumber: { contains: filter.search, mode: 'insensitive' } },
      ];
    }
    // Age filter logic (requires dateOfBirth)
    // ...
    return this.prisma.member.findMany({ where });
  }

  async getBirthdayMembers(range: BirthdayRangeEnum) {
    const today = new Date();
    let start: Date, end: Date;
    if (range === BirthdayRangeEnum.TODAY) {
      start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      end = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + 1,
      );
    } else if (range === BirthdayRangeEnum.THIS_WEEK) {
      const day = today.getDay();
      start = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() - day,
      );
      end = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + (6 - day) + 1,
      );
    } else {
      start = new Date(today.getFullYear(), today.getMonth(), 1);
      end = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    }
    return this.prisma.member.findMany({
      where: {
        dateOfBirth: {
          gte: start,
          lt: end,
        },
      },
    });
  }

  async searchMembers(query: string) {
    return this.prisma.member.findMany({
      where: {
        OR: [
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { phoneNumber: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 20,
    });
  }

  // Add a helper to resolve member contact info by IDs
  async getMemberEmailsByIds(ids: string[]): Promise<string[]> {
    if (!ids.length) return [];
    const members = await this.prisma.member.findMany({
      where: { id: { in: ids } },
      select: { email: true },
    });
    return members.map((m) => m.email).filter((e): e is string => !!e);
  }

  async getMemberPhonesByIds(ids: string[]): Promise<string[]> {
    if (!ids.length) return [];
    const members = await this.prisma.member.findMany({
      where: { id: { in: ids } },
      select: { phoneNumber: true },
    });
    return members.map((m) => m.phoneNumber).filter((e): e is string => !!e);
  }

  /**
   * Centrally resolve advanced recipient filters to member IDs (for SMS) or emails (for Email).
   *
   * @param filters - Array of filter keys (e.g. 'all-members', 'parents', etc)
   * @param options - branchId, organisationId, contactType ('id' | 'email' | 'phone')
   * @returns string[] (member IDs, emails, or phone numbers)
   */
  async resolveFilterRecipients(
    filters: string[] = [],
    options?: {
      branchId?: string;
      organisationId?: string;
      contactType?: 'id' | 'email' | 'phone';
    },
  ): Promise<string[]> {
    const { branchId, organisationId, contactType = 'id' } = options || {};
    const resultSet = new Set<string>();
    for (const filter of filters) {
      switch (filter) {
        case 'all-members': {
          const members = await this.prisma.member.findMany({
            where: {
              status: 'ACTIVE',
              ...(branchId ? { branchId } : {}),
              ...(organisationId ? { organisationId } : {}),
              ...(contactType === 'email' ? { email: { not: null } } : {}),
              ...(contactType === 'phone'
                ? { phoneNumber: { not: null } }
                : {}),
            },
            select:
              contactType === 'id'
                ? { id: true }
                : contactType === 'email'
                  ? { email: true }
                  : { phoneNumber: true },
          });
          members.forEach((m) => resultSet.add(m[contactType]));
          break;
        }
        case 'volunteers': {
          const volunteerMembers =
            await this.prisma.childrenMinistryVolunteer.findMany({
              where: {
                ...(branchId ? { branchId } : {}),
                ...(organisationId ? { organisationId } : {}),
              },
              select: { memberId: true },
            });
          const ids = volunteerMembers.map((v) => v.memberId);
          if (ids.length && contactType !== 'id') {
            const members = await this.prisma.member.findMany({
              where: {
                id: { in: ids },
                ...(contactType === 'email' ? { email: { not: null } } : {}),
                ...(contactType === 'phone'
                  ? { phoneNumber: { not: null } }
                  : {}),
              },
              select:
                contactType === 'email'
                  ? { email: true }
                  : { phoneNumber: true },
            });
            members.forEach((m) => resultSet.add(m[contactType]));
          } else {
            ids.forEach((id) => resultSet.add(id));
          }
          break;
        }
        case 'inactive': {
          const members = await this.prisma.member.findMany({
            where: {
              status: 'INACTIVE',
              ...(branchId ? { branchId } : {}),
              ...(organisationId ? { organisationId } : {}),
              ...(contactType === 'email' ? { email: { not: null } } : {}),
              ...(contactType === 'phone'
                ? { phoneNumber: { not: null } }
                : {}),
            },
            select:
              contactType === 'id'
                ? { id: true }
                : contactType === 'email'
                  ? { email: true }
                  : { phoneNumber: true },
          });
          members.forEach((m) => resultSet.add(m[contactType]));
          break;
        }
        case 'donors': {
          const donorMembers = await this.prisma.member.findMany({
            where: {
              transactions: { some: {} },
              ...(branchId ? { branchId } : {}),
              ...(organisationId ? { organisationId } : {}),
              ...(contactType === 'email' ? { email: { not: null } } : {}),
              ...(contactType === 'phone'
                ? { phoneNumber: { not: null } }
                : {}),
            },
            select:
              contactType === 'id'
                ? { id: true }
                : contactType === 'email'
                  ? { email: true }
                  : { phoneNumber: true },
          });
          donorMembers.forEach((m) => resultSet.add(m[contactType]));
          break;
        }
        case 'parents': {
          const parentLinks = await this.prisma.familyRelationship.findMany({
            where: {
              relationshipType: 'PARENT',
            },
            select: { memberId: true },
          });
          const parentIds = parentLinks.map((r) => r.memberId);
          if (parentIds.length && contactType !== 'id') {
            const parents = await this.prisma.member.findMany({
              where: {
                id: { in: parentIds },
                ...(contactType === 'email' ? { email: { not: null } } : {}),
                ...(contactType === 'phone'
                  ? { phoneNumber: { not: null } }
                  : {}),
              },
              select:
                contactType === 'email'
                  ? { email: true }
                  : { phoneNumber: true },
            });
            parents.forEach((m) => resultSet.add(m[contactType]));
          } else {
            parentIds.forEach((id) => resultSet.add(id));
          }
          break;
        }
        case 'families': {
          // All members with a FamilyRelationship (any type)
          const familyLinks = await this.prisma.familyRelationship.findMany({
            select: { memberId: true },
          });
          const familyMemberIds = familyLinks.map((r) => r.memberId);
          if (familyMemberIds.length && contactType !== 'id') {
            const members = await this.prisma.member.findMany({
              where: {
                id: { in: familyMemberIds },
                ...(contactType === 'email' ? { email: { not: null } } : {}),
                ...(contactType === 'phone'
                  ? { phoneNumber: { not: null } }
                  : {}),
                ...(branchId ? { branchId } : {}),
                ...(organisationId ? { organisationId } : {}),
              },
              select:
                contactType === 'email'
                  ? { email: true }
                  : { phoneNumber: true },
            });
            members.forEach((m) => resultSet.add(m[contactType]));
          } else {
            familyMemberIds.forEach((id) => resultSet.add(id));
          }
          break;
        }
        case 'anniversary-celebrants': {
          // Members whose sacramental anniversary (any type) is this month (from SacramentalRecord)
          const today = new Date();
          const where: any = {
            dateOfSacrament: { not: null },
            ...(branchId ? { branchId } : {}),
            ...(organisationId ? { organisationId } : {}),
          };
          const records = await this.prisma.sacramentalRecord.findMany({
            where,
            select: {
              memberId: true,
              dateOfSacrament: true,
              sacramentType: true,
            },
          });
          // Anniversary = month match
          const celebrantIds = records
            .filter(
              (r) =>
                r.dateOfSacrament &&
                new Date(r.dateOfSacrament).getMonth() === today.getMonth(),
            )
            .map((r) => r.memberId);
          if (celebrantIds.length && contactType !== 'id') {
            const members = await this.prisma.member.findMany({
              where: {
                id: { in: celebrantIds },
                ...(contactType === 'email' ? { email: { not: null } } : {}),
                ...(contactType === 'phone'
                  ? { phoneNumber: { not: null } }
                  : {}),
              },
              select:
                contactType === 'email'
                  ? { email: true }
                  : { phoneNumber: true },
            });
            members.forEach((m) => resultSet.add(m[contactType]));
          } else {
            celebrantIds.forEach((id) => resultSet.add(id));
          }
          break;
        }
        case 'prayer-request-submitters': {
          const submitters = await this.prisma.member.findMany({
            where: {
              prayerRequests: { some: {} },
              ...(branchId ? { branchId } : {}),
              ...(organisationId ? { organisationId } : {}),
              ...(contactType === 'email' ? { email: { not: null } } : {}),
              ...(contactType === 'phone'
                ? { phoneNumber: { not: null } }
                : {}),
            },
            select:
              contactType === 'id'
                ? { id: true }
                : contactType === 'email'
                  ? { email: true }
                  : { phoneNumber: true },
          });
          submitters.forEach((m) => resultSet.add(m[contactType]));
          break;
        }
        case 'new-members': {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          const newMembers = await this.prisma.member.findMany({
            where: {
              createdAt: { gte: thirtyDaysAgo },
              ...(branchId ? { branchId } : {}),
              ...(organisationId ? { organisationId } : {}),
              ...(contactType === 'email' ? { email: { not: null } } : {}),
              ...(contactType === 'phone'
                ? { phoneNumber: { not: null } }
                : {}),
            },
            select:
              contactType === 'id'
                ? { id: true }
                : contactType === 'email'
                  ? { email: true }
                  : { phoneNumber: true },
          });
          newMembers.forEach((m) => resultSet.add(m[contactType]));
          break;
        }
        case 'recently-baptised': {
          // Members with a baptism sacrament in the last 30 days (SacramentalRecord)
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          const where: any = {
            sacramentType: 'BAPTISM',
            dateOfSacrament: { gte: thirtyDaysAgo },
            ...(branchId ? { branchId } : {}),
            ...(organisationId ? { organisationId } : {}),
          };
          const baptismRecords = await this.prisma.sacramentalRecord.findMany({
            where,
            select: { memberId: true },
          });
          const baptisedIds = baptismRecords.map((r) => r.memberId);
          if (baptisedIds.length && contactType !== 'id') {
            const members = await this.prisma.member.findMany({
              where: {
                id: { in: baptisedIds },
                ...(contactType === 'email' ? { email: { not: null } } : {}),
                ...(contactType === 'phone'
                  ? { phoneNumber: { not: null } }
                  : {}),
              },
              select:
                contactType === 'email'
                  ? { email: true }
                  : { phoneNumber: true },
            });
            members.forEach((m) => resultSet.add(m[contactType]));
          } else {
            baptisedIds.forEach((id) => resultSet.add(id));
          }
          break;
        }
        default:
          // Support for custom lists: filter key format 'custom-list:comma-separated-list'
          if (filter.startsWith('custom-list:')) {
            const listString = filter.substring('custom-list:'.length);
            if (listString) {
              // Split by comma, trim, and dedupe
              const rawList = listString
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean);
              // Optionally validate email/phone if contactType is specified
              if (contactType === 'email') {
                const emailRegex =
                  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                rawList
                  .filter((e) => emailRegex.test(e))
                  .forEach((e) => resultSet.add(e));
              } else if (contactType === 'phone') {
                // Very basic phone validation (customize as needed)
                const phoneRegex = /^[+]?\d{7,15}$/;
                rawList
                  .filter((p) => phoneRegex.test(p))
                  .forEach((p) => resultSet.add(p));
              } else {
                // For 'id' or generic, add all
                rawList.forEach((v) => resultSet.add(v));
              }
              break;
            }
          }
          throw new Error(`Unknown or unsupported recipient filter: ${filter}`);
      }
    }
    // Remove null/undefined
    return Array.from(resultSet).filter(Boolean);
  }

  /**
   * Centrally personalize a message template for a given member.
   * Supports placeholders: {{firstName}}, {{lastName}}, {{email}}, {{phoneNumber}}, {{fullName}}, {{churchName}}, {{dateOfBirth}}, {{date}}
   *
   * @param template - The message template string
   * @param member - Member object (with at least firstName, lastName, email, phoneNumber, dateOfBirth)
   * @param churchName - Name of the church (optional)
   * @returns Personalized message string
   */
  async personalizeMessage(
    template: string,
    member: any,
    churchName?: string,
  ): Promise<string> {
    const today = new Date();
    const replacements: Record<string, string> = {
      firstName: member.firstName || '',
      lastName: member.lastName || '',
      email: member.email || '',
      phoneNumber: member.phoneNumber || '',
      fullName: `${member.firstName || ''} ${member.lastName || ''}`.trim(),
      churchName: churchName || '',
      dateOfBirth: member.dateOfBirth
        ? typeof member.dateOfBirth === 'string'
          ? member.dateOfBirth
          : new Date(member.dateOfBirth).toLocaleDateString('en-GB')
        : '',
      date: today.toLocaleDateString('en-GB'),
    };
    return template
      .replace(/\{\{(\w+)\}\}/g, (_, key) => replacements[key] ?? '')
      .replace(/\{(\w+)\}/g, (_, key) => replacements[key] ?? '');
  }
}
