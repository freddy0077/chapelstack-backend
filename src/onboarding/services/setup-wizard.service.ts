import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BranchesService } from '../../branches/branches.service';
import { UsersService } from '../../users/users.service';
import { SettingsService } from '../../settings/settings.service';
import { InitialBranchSetupInput } from '../dto/initial-branch-setup.input';
import { InitialSettingsInput } from '../dto/initial-settings.input';
import { OnboardingService } from './onboarding.service';
import { MembersService } from '../../members/services/members.service';
import { FileUpload } from 'graphql-upload';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { promisify } from 'util';
import bcrypt from 'bcrypt';

const pipeline = promisify(require('stream').pipeline);

@Injectable()
export class SetupWizardService {
  private readonly logger = new Logger(SetupWizardService.name);
  private readonly uploadDir = path.join(process.cwd(), 'uploads');

  constructor(
    private prisma: PrismaService,
    private branchesService: BranchesService,
    private usersService: UsersService,
    private settingsService: SettingsService,
    private onboardingService: OnboardingService,
    private membersService: MembersService,
  ) {
    // Ensure upload directory exists
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async initiateBranchSetup(input: InitialBranchSetupInput): Promise<any> {
    try {
      // Create the branch
      const branch = await this.branchesService.create({
        name: input.name,
        address: input.address,
        city: input.city,
        country: input.country,
        email: input.email,
        phoneNumber: input.phoneNumber,
        organisationId: input.organisationId,
      });

      // Initialize onboarding progress
      await this.onboardingService.initializeOnboarding(branch.id);

      // Save additional settings if provided
      if (input.timezone) {
        await this.settingsService.create({
          key: 'timezone',
          value: input.timezone,
          branchId: branch.id,
        });
      }

      if (input.currency) {
        await this.settingsService.create({
          key: 'currency',
          value: input.currency,
          branchId: branch.id,
        });
      }

      return branch;
    } catch (error) {
      this.logger.error(`Error in branch setup: ${error.message}`, error.stack);
      throw error;
    }
  }

  async configureInitialSettings(
    branchId: string,
    input: InitialSettingsInput,
  ): Promise<boolean> {
    try {
      // Save organization name
      await this.settingsService.create({
        key: 'organizationName',
        value: input.organizationName,
        branchId,
      });

      // Save organization description if provided
      if (input.organizationDescription) {
        await this.settingsService.create({
          key: 'organizationDescription',
          value: input.organizationDescription,
          branchId,
        });
      }

      // Save color settings if provided
      if (input.primaryColor) {
        await this.settingsService.create({
          key: 'primaryColor',
          value: input.primaryColor,
          branchId,
        });
      }

      if (input.secondaryColor) {
        await this.settingsService.create({
          key: 'secondaryColor',
          value: input.secondaryColor,
          branchId,
        });
      }

      // Save website URL if provided
      if (input.websiteUrl) {
        await this.settingsService.create({
          key: 'websiteUrl',
          value: input.websiteUrl,
          branchId,
        });
      }

      // Process logo upload if provided
      if (input.logo) {
        const logoUrl = await this.processLogoUpload(
          branchId,
          await input.logo,
        );
        await this.settingsService.create({
          key: 'logoUrl',
          value: logoUrl,
          branchId,
        });
      }

      return true;
    } catch (error) {
      this.logger.error(
        `Error configuring initial settings: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  private async processLogoUpload(
    branchId: string,
    file: FileUpload,
  ): Promise<string> {
    try {
      const { createReadStream, filename } = file;
      const uniqueFilename = `${branchId}_${uuidv4()}${path.extname(filename)}`;
      const filePath = path.join(this.uploadDir, uniqueFilename);

      // Save the file
      await pipeline(createReadStream(), fs.createWriteStream(filePath));

      // Return the relative path to the file
      return `/uploads/${uniqueFilename}`;
    } catch (error) {
      this.logger.error(`Error uploading logo: ${error.message}`, error.stack);
      throw error;
    }
  }

  async createSuperAdminUser(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    organisationId: string,
    branchId?: string,
  ): Promise<any> {
    try {
      // Pass raw password (not hashed) to usersService.create
      const user = await this.usersService.create({
        email,
        password, // raw password
        firstName,
        lastName,
        organisationId,
      });

      // Create a corresponding member and link it to the user
      await this.membersService.createMember({
        firstName,
        lastName,
        email,
        branchId,
        organisationId,
        userId: user.id,
      });

      // Assign SUPER_ADMIN role to user (User.roles relation)
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          roles: {
            connect: { id: await this.getSuperAdminRoleId() },
          },
        },
      });

      // Assign super admin role to branch if branchId is provided
      // if (branchId) {
        await this.prisma.userBranch.create({
          data: {
            userId: user.id,
            branchId,
            roleId: await this.getSuperAdminRoleId(),
            // Optionally, store organisationId if needed in userBranch
          },
        });
      // }

      return user;
    } catch (error) {
      this.logger.error(`Error creating super admin user: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async getSuperAdminRoleId(): Promise<string> {
    try {
      const superAdminRole = await this.prisma.role.findFirst({
        where: {
          name: 'SUPER_ADMIN',
        },
      });

      if (!superAdminRole) {
        // Create the role if it doesn't exist
        const newRole = await this.prisma.role.create({
          data: {
            name: 'SUPER_ADMIN',
            description: 'Full system access',
          },
        });
        return newRole.id;
      }

      return superAdminRole.id;
    } catch (error) {
      this.logger.error(
        `Error getting super admin role: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
