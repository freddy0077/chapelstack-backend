import { Resolver, Query, Args } from '@nestjs/graphql';
import {
  MemberFilterInput,
  BirthdayRangeEnum,
} from '../dto/member-filter.input';
import { RecipientGroup } from '../entities/recipient-group.entity';
import { Inject } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Member } from '../../members/entities/member.entity';

@Resolver()
export class RecipientResolver {
  constructor(@Inject(PrismaService) private prisma: PrismaService) {}

  @Query(() => [RecipientGroup])
  async recipientGroups(): Promise<RecipientGroup[]> {
    // Example: Combine ministries and small groups as recipient groups
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

  @Query(() => [Member])
  async filteredMembers(
    @Args('filter', { type: () => MemberFilterInput, nullable: true })
    filter?: MemberFilterInput,
  ): Promise<Member[]> {
    // Build Prisma where clause
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

  @Query(() => [Member])
  async birthdayMembers(
    @Args('range', { type: () => BirthdayRangeEnum }) range: BirthdayRangeEnum,
  ): Promise<Member[]> {
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

  @Query(() => [Member])
  async memberSearch(
    @Args('query', { type: () => String }) query: string,
  ): Promise<Member[]> {
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
}
