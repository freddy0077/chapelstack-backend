import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Branch } from '../entities/branch.entity';

@ObjectType()
export class PaginatedBranches {
  @Field(() => [Branch], {
    description: 'A list of branches for the current page',
  })
  items: Branch[];

  @Field(() => Int, {
    description: 'Total number of branches matching the filter',
  })
  totalCount: number;

  @Field({
    description: 'Indicates if there are more branches to fetch',
  })
  hasNextPage: boolean;
}
