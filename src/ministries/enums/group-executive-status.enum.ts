import { registerEnumType } from '@nestjs/graphql';

export enum GroupExecutiveStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

registerEnumType(GroupExecutiveStatus, {
  name: 'GroupExecutiveStatus',
  description: 'Status of group executive',
});
