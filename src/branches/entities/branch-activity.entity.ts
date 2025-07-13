import { Field, ID, ObjectType } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';

@ObjectType()
export class ActivityMetadata {
  @Field(() => String, { nullable: true })
  entityId?: string;

  @Field(() => String, { nullable: true })
  entityType?: string;

  @Field(() => String, { nullable: true })
  details?: string;
}

@ObjectType()
export class BranchActivity {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  type: string;

  @Field(() => String)
  description: string;

  @Field(() => Date)
  timestamp: Date;

  @Field(() => String)
  branchId: string;

  @Field(() => User, { nullable: true })
  user?: User;

  @Field(() => ActivityMetadata, { nullable: true })
  metadata?: ActivityMetadata;
}
