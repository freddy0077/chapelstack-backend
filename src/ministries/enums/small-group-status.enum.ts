import { registerEnumType } from '@nestjs/graphql';

/**
 * Enum for small group status
 */
export enum SmallGroupStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  FULL = 'FULL',
  ARCHIVED = 'ARCHIVED',
}

registerEnumType(SmallGroupStatus, {
  name: 'SmallGroupStatus',
  description: 'Status options for small groups',
});
