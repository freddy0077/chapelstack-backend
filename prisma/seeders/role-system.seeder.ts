import { PrismaClient } from '@prisma/client';
import { ROLE_REGISTRY, PERMISSION_REGISTRY, MODULE_REGISTRY } from '../../src/auth/config/role-registry';

/**
 * Seed the role system with all roles, permissions, and modules
 * This creates the centralized role management system in the database
 */
export async function seedRoleSystem(prisma: PrismaClient) {
  console.log('📋 Seeding role system (roles, permissions, modules)...');

  try {
    // Seed permissions
    console.log('  → Seeding permissions...');
    for (const [id, perm] of Object.entries(PERMISSION_REGISTRY)) {
      await prisma.permission.upsert({
        where: { id },
        update: {
          action: perm.action,
          subject: perm.subject,
          description: perm.description,
          category: perm.category,
          isSystem: true,
        },
        create: {
          id,
          action: perm.action,
          subject: perm.subject,
          description: perm.description,
          category: perm.category,
          isSystem: true,
        },
      });
    }
    console.log(`  ✅ ${Object.keys(PERMISSION_REGISTRY).length} permissions seeded`);

    // Seed modules
    console.log('  → Seeding modules...');
    for (const [id, mod] of Object.entries(MODULE_REGISTRY)) {
      await prisma.module.upsert({
        where: { id },
        update: {
          name: mod.name,
          displayName: mod.displayName,
          description: mod.description,
          icon: mod.icon,
          path: mod.path,
          category: mod.category,
          isSystem: true,
        },
        create: {
          id,
          name: mod.name,
          displayName: mod.displayName,
          description: mod.description,
          icon: mod.icon,
          path: mod.path,
          category: mod.category,
          isSystem: true,
        },
      });
    }
    console.log(`  ✅ ${Object.keys(MODULE_REGISTRY).length} modules seeded`);

    // Seed roles (in order of hierarchy to handle parent relationships)
    console.log('  → Seeding roles...');
    const roleOrder = [
      'GOD_MODE',
      'SYSTEM_ADMIN',
      'SUBSCRIPTION_MANAGER',
      'ADMIN',
      'BRANCH_ADMIN',
      'FINANCE_MANAGER',
      'PASTORAL_STAFF',
      'MINISTRY_LEADER',
      'MEMBER',
    ];

    for (const roleId of roleOrder) {
      const role = ROLE_REGISTRY[roleId];
      if (!role) continue;

      await prisma.role.upsert({
        where: { id: roleId },
        update: {
          name: roleId,
          displayName: role.displayName,
          description: role.description,
          icon: role.icon,
          color: role.color,
          level: role.level,
          parentId: role.parent || null,
          isSystem: true,
        },
        create: {
          id: roleId,
          name: roleId,
          displayName: role.displayName,
          description: role.description,
          icon: role.icon,
          color: role.color,
          level: role.level,
          parentId: role.parent || null,
          isSystem: true,
        },
      });
    }
    console.log(`  ✅ ${roleOrder.length} roles seeded`);

    // Seed role-permission mappings
    console.log('  → Seeding role-permission mappings...');
    let mappingCount = 0;
    for (const [roleId, role] of Object.entries(ROLE_REGISTRY)) {
      for (const permissionId of role.permissions) {
        await prisma.$executeRawUnsafe(
          `INSERT INTO "_RolePermissions" ("A", "B") 
           VALUES ($1, $2) 
           ON CONFLICT DO NOTHING`,
          permissionId,
          roleId,
        );
        mappingCount++;
      }
    }
    console.log(`  ✅ ${mappingCount} role-permission mappings seeded`);

    // Seed role-module mappings
    console.log('  → Seeding role-module mappings...');
    let moduleCount = 0;
    for (const [roleId, role] of Object.entries(ROLE_REGISTRY)) {
      for (const moduleId of role.modules) {
        await prisma.$executeRawUnsafe(
          `INSERT INTO "_RoleModules" ("A", "B") 
           VALUES ($1, $2) 
           ON CONFLICT DO NOTHING`,
          moduleId,
          roleId,
        );
        moduleCount++;
      }
    }
    console.log(`  ✅ ${moduleCount} role-module mappings seeded`);

    console.log('✅ Role system seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding role system:', error);
    throw error;
  }
}
