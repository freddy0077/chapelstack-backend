import { ObjectType, Field, ID, GraphQLISODateTime } from '@nestjs/graphql';
import { User } from './user.entity';
import { Role } from './role.entity';
import { Branch } from '../../branches/entities/branch.entity';

@ObjectType()
export class UserBranch {
  @Field(() => ID)
  userId: string;

  @Field(() => String, { nullable: true })
  branchId?: string;

  @Field(() => ID)
  roleId: string;

  @Field(() => User)
  user: User;

  @Field(() => Branch, { nullable: true })
  branch?: Branch;

  @Field(() => Role)
  role: Role;

  @Field(() => GraphQLISODateTime)
  assignedAt: Date;

  @Field(() => ID, { nullable: true })
  assignedBy: string | null;
}
