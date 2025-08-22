#!/usr/bin/env ts-node

import { PrismaClient, Permission } from '@prisma/client';

/**
 * Death Register Permissions Seeder
 *
 * This seeder creates the necessary permissions for the Death Register feature
 * and assigns them to appropriate roles.
 */
class DeathRegisterPermissionsSeeder {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async seed() {
    console.log('🌱 Starting Death Register Permissions Seeder...');

    try {
      // Define the death register permissions
      const deathRegisterPermissions = [
        {
          action: 'create',
          subject: 'DeathRegister',
          description: 'Create new death register records',
        },
        {
          action: 'read',
          subject: 'DeathRegister',
          description: 'View death register records and statistics',
        },
        {
          action: 'update',
          subject: 'DeathRegister',
          description: 'Update existing death register records',
        },
        {
          action: 'delete',
          subject: 'DeathRegister',
          description: 'Delete death register records',
        },
      ];

      console.log('📝 Creating Death Register permissions...');

      // Create permissions (upsert to avoid duplicates)
      const createdPermissions: Permission[] = [];
      for (const permissionData of deathRegisterPermissions) {
        const permission = await this.prisma.permission.upsert({
          where: {
            action_subject: {
              action: permissionData.action,
              subject: permissionData.subject,
            },
          },
          update: {
            description: permissionData.description,
          },
          create: permissionData,
        });
        createdPermissions.push(permission);
        console.log(
          `✅ Created/Updated permission: ${permission.action} ${permission.subject}`,
        );
      }

      // Get roles that should have death register permissions
      const roles = await this.prisma.role.findMany({
        where: {
          name: {
            in: ['SUPER_ADMIN', 'ADMIN', 'MODERATOR'],
          },
        },
        include: {
          permissions: true,
        },
      });

      console.log('🔗 Assigning permissions to roles...');

      // Assign permissions to roles using the many-to-many relationship
      for (const role of roles) {
        const permissionIdsToConnect: { id: string }[] = [];

        for (const permission of createdPermissions) {
          // Check if the role already has this permission
          const hasPermission = role.permissions.some(
            (p) => p.id === permission.id,
          );

          if (!hasPermission) {
            permissionIdsToConnect.push({ id: permission.id });
            console.log(
              `✅ Will assign ${permission.action} ${permission.subject} to ${role.name}`,
            );
          } else {
            console.log(
              `⚠️  ${role.name} already has ${permission.action} ${permission.subject}`,
            );
          }
        }

        // Connect new permissions to the role
        if (permissionIdsToConnect.length > 0) {
          await this.prisma.role.update({
            where: { id: role.id },
            data: {
              permissions: {
                connect: permissionIdsToConnect,
              },
            },
          });
        }
      }

      console.log(
        '✅ Death Register Permissions Seeder completed successfully!',
      );
      console.log('📊 Summary:');
      console.log(`   • Created ${createdPermissions.length} permissions`);
      console.log(`   • Assigned permissions to ${roles.length} roles`);
      console.log(
        '   • Roles with Death Register access: SUPER_ADMIN, ADMIN, MODERATOR',
      );
      console.log('');
      console.log(
        '🎯 Death Register feature is now accessible to users with appropriate roles!',
      );
    } catch (error) {
      console.error('❌ Death Register Permissions Seeder failed:', error);
      throw error;
    } finally {
      await this.prisma.$disconnect();
    }
  }
}

// Run the seeder
async function runSeeder() {
  console.log('🚀 Starting Death Register Permissions Seeder...');

  try {
    const seeder = new DeathRegisterPermissionsSeeder();
    await seeder.seed();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeder failed:', error);
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  runSeeder();
}

export { DeathRegisterPermissionsSeeder };
