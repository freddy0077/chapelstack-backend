import { registerEnumType } from '@nestjs/graphql';

export enum ContentStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

registerEnumType(ContentStatus, {
  name: 'ContentStatus',
  description: 'Status of the content/sermon',
});
