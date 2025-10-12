import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  MemberFilterInput,
  BirthdayRangeEnum,
} from '../dto/member-filter.input';
import {
  GetRecipientCountInput,
  RecipientCountResponse,
  RecipientBreakdown,
} from '../dto/recipient-count.dto';

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
            sacramentalRecords: {
              some: {
                dateOfSacrament: { not: { equals: null } },
                // Use raw SQL to check if month matches current month
              },
            },
            ...(branchId ? { branchId } : {}),
            ...(organisationId ? { organisationId } : {}),
            ...(contactType === 'email' ? { email: { not: null } } : {}),
            ...(contactType === 'phone' ? { phoneNumber: { not: null } } : {}),
          };
          const records = await this.prisma.member.findMany({
            where,
            select: {
              id: true,
              sacramentalRecords: {
                select: {
                  dateOfSacrament: true,
                },
              },
            },
          });
          // Anniversary = month match
          const celebrantIds = records
            .filter((r) =>
              r.sacramentalRecords.some(
                (s) =>
                  s.dateOfSacrament &&
                  new Date(s.dateOfSacrament).getMonth() === today.getMonth(),
              ),
            )
            .map((r) => r.id);
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
            sacramentalRecords: {
              some: {
                sacramentType: 'BAPTISM',
                dateOfSacrament: { gte: thirtyDaysAgo },
              },
            },
            ...(branchId ? { branchId } : {}),
            ...(organisationId ? { organisationId } : {}),
            ...(contactType === 'email' ? { email: { not: null } } : {}),
            ...(contactType === 'phone' ? { phoneNumber: { not: null } } : {}),
          };
          const baptismRecords = await this.prisma.member.findMany({
            where,
            select: { id: true },
          });
          const baptisedIds = baptismRecords.map((r) => r.id);
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
   * Get recipient counts for multiple filters without fetching actual data
   *
   * @param filters - Array of filter keys (e.g. 'all-members', 'parents', etc)
   * @param options - branchId, organisationId, contactType ('id' | 'email' | 'phone')
   * @returns Record<string, number> - Object mapping filter keys to their counts
   */
  async getFilterRecipientCounts(
    filters: string[] = [],
    options?: {
      branchId?: string;
      organisationId?: string;
      contactType?: 'id' | 'email' | 'phone';
    },
  ): Promise<Record<string, number>> {
    const { branchId, organisationId, contactType = 'id' } = options || {};
    const counts: Record<string, number> = {};

    for (const filter of filters) {
      try {
        switch (filter) {
          case 'all-members': {
            const count = await this.prisma.member.count({
              where: {
                status: 'ACTIVE',
                ...(branchId ? { branchId } : {}),
                ...(organisationId ? { organisationId } : {}),
                ...(contactType === 'email' ? { email: { not: null } } : {}),
                ...(contactType === 'phone'
                  ? { phoneNumber: { not: null } }
                  : {}),
              },
            });
            counts[filter] = count;
            break;
          }
          case 'volunteers': {
            const count = await this.prisma.childrenMinistryVolunteer.count({
              where: {
                ...(branchId ? { branchId } : {}),
                ...(organisationId ? { organisationId } : {}),
                ...(contactType === 'email'
                  ? {
                      member: { email: { not: null } },
                    }
                  : {}),
                ...(contactType === 'phone'
                  ? {
                      member: { phoneNumber: { not: null } },
                    }
                  : {}),
              },
            });
            counts[filter] = count;
            break;
          }
          case 'inactive': {
            const count = await this.prisma.member.count({
              where: {
                status: 'INACTIVE',
                ...(branchId ? { branchId } : {}),
                ...(organisationId ? { organisationId } : {}),
                ...(contactType === 'email' ? { email: { not: null } } : {}),
                ...(contactType === 'phone'
                  ? { phoneNumber: { not: null } }
                  : {}),
              },
            });
            counts[filter] = count;
            break;
          }
          case 'donors': {
            const count = await this.prisma.member.count({
              where: {
                transactions: { some: {} },
                ...(branchId ? { branchId } : {}),
                ...(organisationId ? { organisationId } : {}),
                ...(contactType === 'email' ? { email: { not: null } } : {}),
                ...(contactType === 'phone'
                  ? { phoneNumber: { not: null } }
                  : {}),
              },
            });
            counts[filter] = count;
            break;
          }
          case 'parents': {
            const count = await this.prisma.member.count({
              where: {
                children: { some: {} }, // Members who have children (are parents)
                ...(branchId ? { branchId } : {}),
                ...(organisationId ? { organisationId } : {}),
                ...(contactType === 'email' ? { email: { not: null } } : {}),
                ...(contactType === 'phone'
                  ? { phoneNumber: { not: null } }
                  : {}),
              },
            });
            counts[filter] = count;
            break;
          }
          case 'families': {
            const count = await this.prisma.member.count({
              where: {
                OR: [
                  { children: { some: {} } }, // Has children
                  { parent: { isNot: null } }, // Has a parent
                  { spouse: { isNot: null } }, // Has a spouse
                ],
                ...(branchId ? { branchId } : {}),
                ...(organisationId ? { organisationId } : {}),
                ...(contactType === 'email' ? { email: { not: null } } : {}),
                ...(contactType === 'phone'
                  ? { phoneNumber: { not: null } }
                  : {}),
              },
            });
            counts[filter] = count;
            break;
          }
          case 'anniversary-celebrants': {
            const today = new Date();
            const count = await this.prisma.member.count({
              where: {
                sacramentalRecords: {
                  some: {
                    dateOfSacrament: { gt: new Date('1970-01-01') },
                    // Use raw SQL to check if month matches current month
                  },
                },
                ...(branchId ? { branchId } : {}),
                ...(organisationId ? { organisationId } : {}),
                ...(contactType === 'email' ? { email: { not: null } } : {}),
                ...(contactType === 'phone'
                  ? { phoneNumber: { not: null } }
                  : {}),
              },
            });
            counts[filter] = count;
            break;
          }
          case 'prayer-request-submitters': {
            const count = await this.prisma.member.count({
              where: {
                prayerRequests: { some: {} },
                ...(branchId ? { branchId } : {}),
                ...(organisationId ? { organisationId } : {}),
                ...(contactType === 'email' ? { email: { not: null } } : {}),
                ...(contactType === 'phone'
                  ? { phoneNumber: { not: null } }
                  : {}),
              },
            });
            counts[filter] = count;
            break;
          }
          case 'new-members': {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const count = await this.prisma.member.count({
              where: {
                createdAt: { gte: thirtyDaysAgo },
                ...(branchId ? { branchId } : {}),
                ...(organisationId ? { organisationId } : {}),
                ...(contactType === 'email' ? { email: { not: null } } : {}),
                ...(contactType === 'phone'
                  ? { phoneNumber: { not: null } }
                  : {}),
              },
            });
            counts[filter] = count;
            break;
          }
          case 'recently-baptised': {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const count = await this.prisma.member.count({
              where: {
                sacramentalRecords: {
                  some: {
                    sacramentType: 'BAPTISM',
                    dateOfSacrament: { gte: thirtyDaysAgo },
                  },
                },
                ...(branchId ? { branchId } : {}),
                ...(organisationId ? { organisationId } : {}),
                ...(contactType === 'email' ? { email: { not: null } } : {}),
                ...(contactType === 'phone'
                  ? { phoneNumber: { not: null } }
                  : {}),
              },
            });
            counts[filter] = count;
            break;
          }
          default:
            // Handle custom lists
            if (filter.startsWith('custom-list:')) {
              const listString = filter.substring('custom-list:'.length);
              if (listString) {
                const rawList = listString
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean);

                if (contactType === 'email') {
                  const emailRegex =
                    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                  counts[filter] = rawList.filter((e) =>
                    emailRegex.test(e),
                  ).length;
                } else if (contactType === 'phone') {
                  const phoneRegex = /^[+]?\d{7,15}$/;
                  counts[filter] = rawList.filter((p) =>
                    phoneRegex.test(p),
                  ).length;
                } else {
                  counts[filter] = rawList.length;
                }
              } else {
                counts[filter] = 0;
              }
              break;
            }
            // Unknown filter
            counts[filter] = 0;
        }
      } catch (error) {
        // If there's an error getting count for a specific filter, set to 0
        counts[filter] = 0;
      }
    }

    return counts;
  }

  /**
   * Get recipient count with breakdown by source (groups, filters, individuals, birthday)
   * @param input - GetRecipientCountInput with memberIds, groupIds, filters, etc.
   * @returns RecipientCountResponse with total, unique count, and breakdown
   */
  async getRecipientCount(
    input: GetRecipientCountInput,
  ): Promise<RecipientCountResponse> {
    const breakdown: RecipientBreakdown[] = [];
    const allMemberIds = new Set<string>();
    let totalCount = 0;

    // 1. Individual members
    if (input.memberIds && input.memberIds.length > 0) {
      const members = await this.prisma.member.findMany({
        where: { id: { in: input.memberIds } },
        select: { id: true, firstName: true, lastName: true },
      });

      members.forEach((member) => {
        allMemberIds.add(member.id);
        breakdown.push({
          source: 'individual',
          name: `${member.firstName} ${member.lastName}`,
          count: 1,
          id: member.id,
        });
      });
      totalCount += members.length;
    }

    // 2. Groups (ministries and small groups)
    if (input.groupIds && input.groupIds.length > 0) {
      for (const groupId of input.groupIds) {
        const groupMembers = await this.prisma.member.findMany({
          where: {
            groupMemberships: {
              some: {
                OR: [
                  { ministryId: groupId },
                  { smallGroupId: groupId },
                ],
                status: 'ACTIVE',
              },
            },
          },
          select: { id: true },
        });

        // Get group name
        const ministry = await this.prisma.ministry.findUnique({
          where: { id: groupId },
          select: { name: true },
        });

        const smallGroup = !ministry
          ? await this.prisma.smallGroup.findUnique({
              where: { id: groupId },
              select: { name: true },
            })
          : null;

        const groupName = ministry?.name || smallGroup?.name || 'Unknown Group';

        groupMembers.forEach((member) => allMemberIds.add(member.id));

        breakdown.push({
          source: 'group',
          name: groupName,
          count: groupMembers.length,
          id: groupId,
        });

        totalCount += groupMembers.length;
      }
    }

    // 3. Filters (status, role, gender, etc.)
    if (input.filters && input.filters.length > 0) {
      for (const filterKey of input.filters) {
        const filterMembers = await this.getFilteredMembersByKey(
          filterKey,
          input.branchId,
          input.organisationId,
        );

        filterMembers.forEach((member) => allMemberIds.add(member.id));

        breakdown.push({
          source: 'filter',
          name: this.getFilterDisplayName(filterKey),
          count: filterMembers.length,
          id: filterKey,
        });

        totalCount += filterMembers.length;
      }
    }

    // 4. Birthday range
    if (input.birthdayRange) {
      const birthdayMembers = await this.getMembersByBirthdayRange(
        input.birthdayRange,
        input.branchId,
      );

      birthdayMembers.forEach((member) => allMemberIds.add(member.id));

      breakdown.push({
        source: 'birthday',
        name: `Birthday: ${input.birthdayRange}`,
        count: birthdayMembers.length,
      });

      totalCount += birthdayMembers.length;
    }

    const uniqueMembers = allMemberIds.size;
    const duplicateCount = totalCount - uniqueMembers;

    return {
      totalMembers: totalCount,
      uniqueMembers,
      duplicateCount,
      breakdown,
      message:
        duplicateCount > 0
          ? `${duplicateCount} member(s) appear in multiple selections`
          : 'No duplicate members',
    };
  }

  /**
   * Get members by filter key
   */
  private async getFilteredMembersByKey(
    filterKey: string,
    branchId?: string,
    organisationId?: string,
  ): Promise<{ id: string }[]> {
    const where: any = {};

    if (branchId) where.branchId = branchId;
    if (organisationId) where.organisationId = organisationId;

    // Parse filter key (e.g., "status:ACTIVE", "role:MEMBER", "gender:MALE")
    const [filterType, filterValue] = filterKey.split(':');

    switch (filterType) {
      case 'status':
        where.status = filterValue;
        break;
      case 'role':
        where.role = filterValue;
        break;
      case 'gender':
        where.gender = filterValue;
        break;
      case 'maritalStatus':
        where.maritalStatus = filterValue;
        break;
      default:
        break;
    }

    return this.prisma.member.findMany({
      where,
      select: { id: true },
    });
  }

  /**
   * Get display name for filter
   */
  private getFilterDisplayName(filterKey: string): string {
    const [filterType, filterValue] = filterKey.split(':');
    return `${filterType}: ${filterValue}`;
  }

  /**
   * Get members by birthday range
   */
  private async getMembersByBirthdayRange(
    range: string,
    branchId?: string,
  ): Promise<{ id: string }[]> {
    const today = new Date();
    const where: any = {};

    if (branchId) where.branchId = branchId;

    // Parse range (e.g., "today", "this_week", "this_month", "next_7_days")
    switch (range) {
      case 'today':
        where.dateOfBirth = {
          gte: new Date(today.setHours(0, 0, 0, 0)),
          lt: new Date(today.setHours(23, 59, 59, 999)),
        };
        break;
      case 'this_week':
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        where.dateOfBirth = {
          gte: startOfWeek,
          lte: endOfWeek,
        };
        break;
      case 'this_month':
        where.dateOfBirth = {
          gte: new Date(today.getFullYear(), today.getMonth(), 1),
          lt: new Date(today.getFullYear(), today.getMonth() + 1, 1),
        };
        break;
      // Add more cases as needed
    }

    return this.prisma.member.findMany({
      where,
      select: { id: true },
    });
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
