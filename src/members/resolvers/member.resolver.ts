import { Resolver, ResolveField, Parent } from '@nestjs/graphql';
import { Member } from '../entities/member.entity';
import { Family } from '../entities/family.entity';
import { FamiliesService } from '../services/families.service';
import { PrismaService } from '../../prisma/prisma.service';

@Resolver(() => Member)
export class MemberResolver {
  constructor(
    private readonly familiesService: FamiliesService,
    private readonly prisma: PrismaService,
  ) {}

  @ResolveField(() => [Family], { nullable: true })
  async families(@Parent() member: Member): Promise<Family[]> {
    // You may want to optimize this or use a dedicated service method
    return this.familiesService.findFamiliesByMemberId(member.id);
  }

  @ResolveField(() => Object, { nullable: true })
  async branch(@Parent() member: Member) {
    if (!member.branchId) return null;
    return this.prisma.branch.findUnique({ where: { id: member.branchId } });
  }

  @ResolveField(() => Object, { nullable: true })
  async spouse(@Parent() member: Member) {
    if (!member.spouseId) return null;
    return this.prisma.member.findUnique({ where: { id: member.spouseId } });
  }

  @ResolveField(() => Object, { nullable: true })
  async parent(@Parent() member: Member) {
    if (!member.parentId) return null;
    return this.prisma.member.findUnique({ where: { id: member.parentId } });
  }
}
