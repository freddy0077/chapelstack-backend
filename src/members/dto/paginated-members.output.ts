import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Member } from '../entities/member.entity';

/**
 * Paginated Members Result
 * 
 * Properly typed pagination wrapper for Member entities
 */
@ObjectType()
export class PaginatedMembersOutput {
  @Field(() => [Member], {
    description: 'Array of Member items for current page',
  })
  data: Member[];

  @Field(() => Int, {
    description: 'Total number of members',
  })
  total: number;

  @Field(() => Int, {
    description: 'Current page number',
  })
  page: number;

  @Field(() => Int, {
    description: 'Number of items per page',
  })
  limit: number;

  @Field(() => Int, {
    description: 'Total number of pages',
  })
  totalPages: number;

  @Field(() => Boolean, {
    description: 'Whether there is a next page',
  })
  hasNextPage: boolean;

  @Field(() => Boolean, {
    description: 'Whether there is a previous page',
  })
  hasPreviousPage: boolean;
}
