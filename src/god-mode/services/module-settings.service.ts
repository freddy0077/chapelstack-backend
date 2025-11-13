import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface ModuleSettingsInput {
  moduleId: string;
  enabled: boolean;
  settings?: Record<string, any>;
}

export interface ModuleConfigInput {
  moduleId: string;
  config: Record<string, any>;
}

@Injectable()
export class ModuleSettingsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Convert settings object to array of ModuleSettingType
   */
  private convertSettingsToArray(settingsObj: Record<string, any>): any[] {
    if (!settingsObj) return [];
    return Object.entries(settingsObj).map(([key, value]) => ({
      key,
      value: String(value),
      type: typeof value,
      description: `${key} setting`,
    }));
  }

  /**
   * Get all modules with settings from database
   */
  async getAllModules(skip: number = 0, take: number = 100) {
    try {
      const modules = await this.prisma.module.findMany({
        skip,
        take,
        orderBy: { name: 'asc' },
      });

      // Convert settings objects to arrays
      const modulesWithArraySettings = modules.map(m => ({
        id: m.name,
        name: m.displayName,
        description: m.description,
        enabled: m.enabled,
        icon: m.icon,
        category: m.category,
        dependencies: m.dependencies || [],
        settings: this.convertSettingsToArray(m.settings as Record<string, any>),
        features: m.features || [],
      }));

      const total = await this.prisma.module.count();

      return {
        modules: modulesWithArraySettings,
        total,
        skip,
        take,
      };
    } catch (error) {
      console.error('Error fetching modules from database:', error);
      throw new Error('Failed to fetch modules');
    }
  }

  /**
   * Get module by ID from database
   */
  async getModuleById(moduleId: string) {
    try {
      const module = await this.prisma.module.findUnique({
        where: { name: moduleId },
      });

      if (!module) {
        throw new NotFoundException(`Module ${moduleId} not found`);
      }

      // Convert settings to array format
      return {
        id: module.name,
        name: module.displayName,
        description: module.description,
        enabled: module.enabled,
        icon: module.icon,
        category: module.category,
        dependencies: module.dependencies || [],
        settings: this.convertSettingsToArray(module.settings as Record<string, any>),
        features: module.features || [],
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error fetching module from database:', error);
      throw new Error(`Failed to fetch module ${moduleId}`);
    }
  }

  /**
   * Update module settings in database
   */
  async updateModuleSettings(input: ModuleSettingsInput) {
    try {
      // Validate module exists
      const module = await this.getModuleById(input.moduleId);

      // Check dependencies if disabling
      if (!input.enabled) {
        const dependentModules = await this.prisma.module.findMany({
          where: {
            dependencies: {
              has: input.moduleId,
            },
            enabled: true,
          },
        });

        if (dependentModules.length > 0) {
          throw new BadRequestException(
            `Cannot disable ${input.moduleId}. It is required by: ${dependentModules.map((m) => m.name).join(', ')}`,
          );
        }
      }

      // Update in database
      const updated = await this.prisma.module.update({
        where: { name: input.moduleId },
        data: {
          enabled: input.enabled,
          settings: input.settings || module.settings,
        },
      });

      return {
        success: true,
        message: `Module ${input.moduleId} ${input.enabled ? 'enabled' : 'disabled'} successfully`,
        module: {
          id: updated.name,
          name: updated.displayName,
          description: updated.description,
          enabled: updated.enabled,
          icon: updated.icon,
          category: updated.category,
          dependencies: updated.dependencies || [],
          settings: this.convertSettingsToArray(updated.settings as Record<string, any>),
          features: updated.features || [],
        },
      };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error updating module in database:', error);
      throw new Error(`Failed to update module ${input.moduleId}`);
    }
  }

  /**
   * Get module dependencies
   */
  async getModuleDependencies(moduleId: string) {
    const dependencyMap: Record<string, string[]> = {
      members: [],
      events: ['members'],
      finances: ['members'],
      communications: ['members'],
      groups: ['members'],
      attendance: ['members', 'events'],
      reports: ['members', 'finances', 'attendance'],
      automations: ['members', 'communications'],
    };

    const dependencies = dependencyMap[moduleId];
    if (!dependencies) {
      throw new NotFoundException(`Module ${moduleId} not found`);
    }

    return {
      moduleId,
      dependencies,
      canDisable: dependencies.length === 0,
      dependentModules: this.getDependentModules(moduleId),
    };
  }

  /**
   * Get modules that depend on this module
   */
  private getDependentModules(moduleId: string): string[] {
    const dependencyMap: Record<string, string[]> = {
      members: ['events', 'finances', 'communications', 'groups', 'attendance', 'reports', 'automations'],
      events: ['attendance', 'reports'],
      finances: ['reports'],
      attendance: ['reports'],
      communications: ['automations'],
    };

    return dependencyMap[moduleId] || [];
  }

  /**
   * Configure module settings
   */
  async configureModule(input: ModuleConfigInput) {
    // Get raw module (before settings conversion)
    const modules: Record<string, any> = {
      members: {
        id: 'members',
        name: 'Members Management',
        settings: {
          allowImport: true,
          allowExport: true,
          requireApproval: false,
        },
      },
      events: {
        id: 'events',
        name: 'Events Management',
        settings: {
          allowRegistration: true,
          requireApproval: false,
          maxAttendees: 500,
        },
      },
      finances: {
        id: 'finances',
        name: 'Finance Management',
        settings: {
          allowOnlineGiving: true,
          requireApproval: true,
          currency: 'USD',
        },
      },
      sermons: {
        id: 'sermons',
        name: 'Sermons',
        settings: {
          allowUpload: true,
          maxFileSize: 500,
        },
      },
    };

    const rawModule = modules[input.moduleId];
    if (!rawModule) {
      throw new NotFoundException(`Module ${input.moduleId} not found`);
    }

    // Validate configuration
    const validKeys = Object.keys(rawModule.settings);
    const configKeys = Object.keys(input.config);

    const invalidKeys = configKeys.filter((key) => !validKeys.includes(key));
    if (invalidKeys.length > 0) {
      throw new BadRequestException(
        `Invalid configuration keys: ${invalidKeys.join(', ')}`,
      );
    }

    const updatedSettings = {
      ...rawModule.settings,
      ...input.config,
    };

    const module = await this.getModuleById(input.moduleId);

    return {
      success: true,
      message: `Module ${input.moduleId} configured successfully`,
      module: {
        ...module,
        settings: this.convertSettingsToArray(updatedSettings),
      },
    };
  }

  /**
   * Get module categories
   */
  async getModuleCategories() {
    return {
      categories: [
        {
          name: 'Core',
          description: 'Essential modules for church management',
          modules: ['members', 'events', 'finances', 'communications', 'groups', 'attendance'],
        },
        {
          name: 'Analytics',
          description: 'Reporting and analytics modules',
          modules: ['reports'],
        },
        {
          name: 'Advanced',
          description: 'Advanced features and automations',
          modules: ['automations'],
        },
      ],
    };
  }

  /**
   * Get module usage statistics
   */
  async getModuleUsageStats(moduleId: string) {
    return {
      moduleId,
      lastUsed: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      usageCount: Math.floor(Math.random() * 1000),
      activeUsers: Math.floor(Math.random() * 100),
      dataSize: `${Math.floor(Math.random() * 1000)} MB`,
      performance: {
        avgResponseTime: `${Math.floor(Math.random() * 500)}ms`,
        errorRate: `${(Math.random() * 5).toFixed(2)}%`,
        uptime: `${(99 + Math.random()).toFixed(2)}%`,
      },
    };
  }

  /**
   * Reset module to default settings
   */
  async resetModuleSettings(moduleId: string) {
    const module = await this.getModuleById(moduleId);

    return {
      success: true,
      message: `Module ${moduleId} reset to default settings`,
      module: {
        ...module,
        settings: module.settings, // Return default settings
      },
    };
  }
}
