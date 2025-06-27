import { SetMetadata } from '@nestjs/common';
import { Permission } from '../enums/permission.enum';

export const PERMISSIONS_KEY = 'permissions';

export interface PermissionRequirement {
  action: string;
  subject: string;
}

export const RequirePermissions = (
  permission: PermissionRequirement | Permission,
) => SetMetadata(PERMISSIONS_KEY, permission);
