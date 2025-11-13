import { registerEnumType } from '@nestjs/graphql';

export enum GroupExecutiveRole {
  LEADER = 'LEADER',
  ASSISTANT_LEADER = 'ASSISTANT_LEADER',
  SECRETARY = 'SECRETARY',
  TREASURER = 'TREASURER',
  ORGANIZER = 'ORGANIZER',
  COORDINATOR = 'COORDINATOR',
  OTHER = 'OTHER',
}

registerEnumType(GroupExecutiveRole, {
  name: 'GroupExecutiveRole',
  description: 'Roles for group executives',
});
