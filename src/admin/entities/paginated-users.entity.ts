import { ObjectType, Field, Int } from '@nestjs/graphql';
import { User } from '../../auth/entities/user.entity';

@ObjectType()
export class PaginatedUsers {
  @Field(() => [User])
  items: User[];

  @Field(() => Int)
  totalCount: number;

  @Field(() => Boolean)
  hasNextPage: boolean;
}
