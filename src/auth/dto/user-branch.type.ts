import { Field, ObjectType } from '@nestjs/graphql';
import { BranchType } from './branch.type';
import { RoleType } from './role.type';

@ObjectType('UserBranchProfile')
export class UserBranchType {
  @Field(() => String)
  userId: string;

  @Field(() => String, { nullable: true })
  branchId?: string;

  @Field(() => String)
  roleId: string;

  @Field(() => Date)
  assignedAt: Date;

  @Field(() => String, { nullable: true })
  assignedBy?: string | null;

  @Field(() => BranchType, { nullable: true })
  branch?: BranchType;

  @Field(() => RoleType)
  role: RoleType;
}
