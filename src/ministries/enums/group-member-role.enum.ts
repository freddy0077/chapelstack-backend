import { registerEnumType } from '@nestjs/graphql';

/**
 * Enum for group member roles
 */
export enum GroupMemberRole {
  LEADER = 'LEADER',
  ASSISTANT_LEADER = 'ASSISTANT_LEADER',
  MEMBER = 'MEMBER',
  VOLUNTEER = 'VOLUNTEER',
}

registerEnumType(GroupMemberRole, {
  name: 'GroupMemberRole',
  description: 'Roles available for ministry and small group members',
});
