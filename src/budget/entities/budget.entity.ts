import { ObjectType, Field, Float, Int, ID } from '@nestjs/graphql';
import { BudgetItem } from './budget-item.entity';
import { Fund } from '../../funds/entities/fund.entity';
import { Ministry } from '../../ministries/entities/ministry.entity';
import { Branch } from '../../branches/entities/branch.entity';
import { Organisation } from '../../organisation/dto/organisation.model';

@ObjectType()
export class Budget {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => Int)
  fiscalYear: number;

  @Field(() => Date)
  startDate: Date;

  @Field(() => Date)
  endDate: Date;

  @Field(() => Float)
  totalAmount: number;

  @Field(() => Float)
  totalSpent: number;

  @Field(() => String)
  status: string;

  @Field(() => String, { nullable: true })
  notes?: string;

  @Field(() => String)
  fundId: string;

  @Field(() => String, { nullable: true })
  ministryId?: string;

  @Field(() => String, { nullable: true })
  branchId?: string;

  @Field(() => String, { nullable: true })
  createdById?: string;

  @Field(() => String, { nullable: true })
  updatedById?: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => String, { nullable: true })
  organisationId?: string;

  // Relations
  @Field(() => [BudgetItem], { nullable: true })
  budgetItems?: BudgetItem[];

  @Field(() => Fund, { nullable: true })
  fund?: Fund;

  @Field(() => Ministry, { nullable: true })
  ministry?: Ministry;

  @Field(() => Branch, { nullable: true })
  branch?: Branch;

  @Field(() => Organisation, { nullable: true })
  organisation?: Organisation;
}
