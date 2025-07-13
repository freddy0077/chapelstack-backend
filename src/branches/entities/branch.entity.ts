import { ObjectType, Field, ID, GraphQLISODateTime } from '@nestjs/graphql';
import { BranchSetting } from './branch-setting.entity';
import { BranchStatistics } from '../dto/branch-statistics.output';
import { BranchSettings } from './branch-settings.entity';
import { PaginatedTransferRequests } from '../../transfers/dto/paginated-transfer-requests.output';

@ObjectType()
export class Branch {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  address?: string;

  @Field(() => String, { nullable: true })
  city?: string;

  @Field(() => String, { nullable: true })
  state?: string;

  @Field(() => String, { nullable: true })
  postalCode?: string;

  @Field(() => String, { nullable: true })
  country?: string;

  @Field(() => String, { nullable: true })
  phoneNumber?: string;

  @Field(() => String, { nullable: true })
  email?: string;

  @Field(() => String, { nullable: true })
  website?: string;

  @Field(() => Date, { nullable: true })
  establishedAt?: Date;

  @Field(() => Boolean, { defaultValue: true })
  isActive: boolean;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => String, { nullable: true })
  location?: string;

  @Field(() => [BranchSetting], { nullable: 'itemsAndList' })
  settings?: BranchSetting[];

  @Field(() => BranchSettings)
  branchSettings?: BranchSettings;

  @Field(() => BranchStatistics, { nullable: true })
  statistics?: BranchStatistics;

  @Field(() => String, { nullable: true })
  organisationId?: string;

  @Field(() => PaginatedTransferRequests)
  incomingTransfers?: PaginatedTransferRequests;

  @Field(() => PaginatedTransferRequests)
  outgoingTransfers?: PaginatedTransferRequests;

  // Note: UserBranch, Member, Event relations will be added as those modules are developed.
}
