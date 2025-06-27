import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';
export type PermissionDef = { action: string; subject: string };
export const Permissions = (...permissions: PermissionDef[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
