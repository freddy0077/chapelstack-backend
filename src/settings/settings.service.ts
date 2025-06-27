import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Setting } from './entities/setting.entity'; // GQL Entity
import { Setting as PrismaSetting } from '@prisma/client'; // Prisma Model
import { CreateSettingInput } from './dto/create-setting.input';
import { UpdateSettingInput } from './dto/update-setting.input';

// Interface for church profile data
export interface ChurchProfileData {
  name?: string;
  numberOfBranches?: number;
  churchSize?: string;
  [key: string]: any; // Allow additional properties
}

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(createSettingInput: CreateSettingInput): Promise<Setting> {
    const { key, value, branchId } = createSettingInput;
    const effectiveBranchId = branchId === undefined ? null : branchId;

    const existingSetting = await this.prisma.setting.findFirst({
      where: {
        key,
        branchId: effectiveBranchId,
      },
    });

    if (existingSetting) {
      throw new ConflictException(
        `Setting with key '${key}'${
          effectiveBranchId ? ` for branch '${effectiveBranchId}'` : ' (global)'
        } already exists.`,
      );
    }

    return this.prisma.setting.create({
      data: {
        key,
        value,
        branchId: effectiveBranchId,
      },
    });
  }

  async findAll(branchId?: string, onlyGlobal = false): Promise<Setting[]> {
    if (branchId) {
      // Fetch settings for a specific branch AND global settings
      return this.prisma.setting.findMany({
        where: {
          OR: [{ branchId: branchId }, { branchId: null }],
        },
        orderBy: [{ branchId: 'asc' }, { key: 'asc' }],
      });
    } else if (onlyGlobal) {
      // Fetch only global settings (branchId is null)
      return this.prisma.setting.findMany({
        where: { branchId: null },
        orderBy: [{ key: 'asc' }],
      });
    } else {
      // Fetch all settings (both global and all branch-specific)
      return this.prisma.setting.findMany({
        orderBy: [{ branchId: 'asc' }, { key: 'asc' }],
      });
    }
  }

  async findOne(id: string): Promise<Setting> {
    const setting = await this.prisma.setting.findUnique({
      where: { id },
    });
    if (!setting) {
      throw new NotFoundException(`Setting with ID '${id}' not found.`);
    }
    return setting;
  }

  async findByKey(key: string, branchId?: string): Promise<Setting> {
    const effectiveBranchId = branchId === undefined ? null : branchId;

    const setting = await this.prisma.setting.findFirst({
      where: {
        key,
        branchId: effectiveBranchId,
      },
    });

    if (!setting) {
      throw new NotFoundException(
        `Setting with key '${key}'${
          effectiveBranchId ? ` for branch '${effectiveBranchId}'` : ' (global)'
        } not found.`,
      );
    }
    return setting;
  }

  async update(
    id: string, // id of the setting to update
    updateSettingInput: UpdateSettingInput,
  ): Promise<Setting> {
    const { id: inputId, ...dataToUpdate } = updateSettingInput;

    if (inputId && inputId !== id) {
      throw new ConflictException('ID in input DTO does not match ID in path.');
    }

    const existingSetting = await this.prisma.setting.findUnique({
      where: { id },
    });
    if (!existingSetting) {
      throw new NotFoundException(`Setting with ID '${id}' not found.`);
    }

    // If key or branchId is being changed, check for conflicts
    if (dataToUpdate.key !== undefined || dataToUpdate.branchId !== undefined) {
      const newKey =
        dataToUpdate.key === undefined ? existingSetting.key : dataToUpdate.key;
      const newBranchId =
        dataToUpdate.branchId === undefined
          ? existingSetting.branchId
          : dataToUpdate.branchId;

      if (
        newKey !== null &&
        (newKey !== existingSetting.key ||
          newBranchId !== existingSetting.branchId)
      ) {
        // Use findFirst for conflict check with nullable branchId
        const conflictingSetting = await this.prisma.setting.findFirst({
          where: {
            key: newKey,
            branchId: newBranchId,
            NOT: {
              id: id, // Exclude the current setting being updated
            },
          },
        });

        if (conflictingSetting) {
          throw new ConflictException(
            `Another setting with key '${newKey}'${
              newBranchId ? ` for branch '${newBranchId}'` : ' (global)'
            } already exists.`,
          );
        }
      }
    }

    const finalData: Partial<PrismaSetting> = { ...dataToUpdate };
    if (dataToUpdate.branchId === null) {
      // Ensure branchId is explicitly set to null if provided as null
      finalData.branchId = null;
    }

    return this.prisma.setting.update({
      where: { id },
      data: finalData,
    });
  }

  async remove(id: string): Promise<Setting> {
    const setting = await this.prisma.setting.findUnique({ where: { id } });
    if (!setting) {
      throw new NotFoundException(`Setting with ID '${id}' not found.`);
    }
    return this.prisma.setting.delete({
      where: { id },
    });
  }

  /**
   * Update or create church profile settings for a branch
   * This method stores church profile data in multiple settings entries
   */
  async updateChurchProfile(
    branchId: string,
    profileData: ChurchProfileData,
  ): Promise<boolean> {
    try {
      this.logger.log(`Updating church profile for branch ${branchId}`);

      // Process each property of the church profile and save as individual settings
      const settingPromises = Object.entries(profileData).map(
        async ([key, value]) => {
          // Skip undefined or null values
          if (value === undefined || value === null) {
            return;
          }

          const settingKey = `churchProfile.${key}`;
          const stringValue =
            typeof value === 'string' ? value : JSON.stringify(value);

          // Check if setting already exists
          try {
            // Try to find and update existing setting
            const existingSetting = await this.findByKey(settingKey, branchId);
            await this.update(existingSetting.id, {
              id: existingSetting.id,
              value: stringValue,
            });
            return true;
          } catch (error) {
            // Setting doesn't exist, create it
            if (error instanceof NotFoundException) {
              await this.create({
                key: settingKey,
                value: stringValue,
                branchId,
              });
              return true;
            }
            // Re-throw any other errors
            throw error;
          }
        },
      );

      // Wait for all settings to be processed
      await Promise.all(settingPromises);

      // You could also update the Branch entity name, if that's appropriate for your architecture
      if (profileData.name) {
        await this.prisma.branch.update({
          where: { id: branchId },
          data: { name: profileData.name },
        });
      }

      return true;
    } catch (error) {
      this.logger.error(
        `Error updating church profile for branch ${branchId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }
}
