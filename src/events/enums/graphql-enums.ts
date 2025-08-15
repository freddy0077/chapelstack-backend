import { registerEnumType } from '@nestjs/graphql';
import { EventType, EventStatus, RSVPStatus } from '@prisma/client';

// Register Prisma enums as GraphQL enums
registerEnumType(EventType, {
  name: 'EventType',
  description: 'The type of event',
});

registerEnumType(EventStatus, {
  name: 'EventStatus',
  description: 'The status of an event',
});

registerEnumType(RSVPStatus, {
  name: 'RSVPStatus',
  description: 'The RSVP status for an event',
});

// Export the enums for use in entities
export { EventType, EventStatus, RSVPStatus };
