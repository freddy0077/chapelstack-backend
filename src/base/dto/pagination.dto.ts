import { InputType, ObjectType, Field, Int } from '@nestjs/graphql';
import { IsOptional, Min, IsIn } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

/**
 * Pagination Input DTO
 * 
 * Used for GraphQL queries to specify pagination parameters
 */
@InputType()
export class PaginationInput {
  @Field(() => Int, {
    nullable: true,
    description: 'Current page number (1-indexed)',
    defaultValue: 1,
  })
  @IsOptional()
  @Min(1)
  page?: number = 1;

  @Field(() => Int, {
    nullable: true,
    description: 'Number of items per page',
    defaultValue: 10,
  })
  @IsOptional()
  @Min(1)
  limit?: number = 10;

  @Field(() => String, {
    nullable: true,
    description: 'Field to sort by',
    defaultValue: 'createdAt',
  })
  @IsOptional()
  sortBy?: string = 'createdAt';

  @Field(() => String, {
    nullable: true,
    description: 'Sort order (asc or desc)',
    defaultValue: 'asc',
  })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'asc';
}

/**
 * Paginated Result DTO
 * 
 * Generic response type for paginated data
 * 
 * Usage in resolvers:
 * @Query(() => PaginatedMembers)
 * async findAll(...): Promise<PaginatedResult<Member>> {
 *   return this.service.findAll(...);
 * }
 */
@ObjectType({ isAbstract: true })
export class PaginatedResult<T> {
  @Field(() => GraphQLJSON, {
    description: 'Array of items for current page',
  })
  data: T[];

  @Field(() => Int, {
    description: 'Total number of items',
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

/**
 * Paginated Members Result
 * 
 * Concrete implementation for Member pagination
 */
// Intentionally left undefined here. Define concrete paginated output types
// in their respective feature modules (e.g., members) to reference real
// ObjectTypes and avoid circular dependencies.
