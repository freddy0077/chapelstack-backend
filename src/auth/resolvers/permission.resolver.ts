import { Resolver, Query } from '@nestjs/graphql';
import { Permission } from '../entities/permission.entity';
import { Inject } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Resolver(() => Permission)
export class PermissionResolver {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  // Returns permissions grouped by subject
  @Query(() => [[Permission]], { name: 'permissionsGroupedBySubject' })
  async permissionsGroupedBySubject(): Promise<Permission[][]> {
    const permissions = await this.prisma.permission.findMany();
    const grouped: Record<string, Permission[]> = {};
    for (const perm of permissions) {
      // Fix: convert null description to undefined for compatibility
      const safePerm = { ...perm, description: perm.description ?? undefined };
      if (!grouped[perm.subject]) grouped[perm.subject] = [];
      grouped[perm.subject].push(safePerm as Permission);
    }
    return Object.values(grouped);
  }
}
