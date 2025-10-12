import { Args, Query, Resolver, ObjectType, Field, ID } from '@nestjs/graphql';
import { RecipientService } from '../services/recipient.service';
import { PrismaService } from '../../prisma/prisma.service';
import {
  GetRecipientCountInput,
  RecipientCountResponse,
} from '../dto/recipient-count.dto';

@ObjectType()
export class RecipientGroup {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  type: string;
}

@Resolver(() => RecipientCountResponse)
export class RecipientCountResolver {
  constructor(
    private readonly recipientService: RecipientService,
    private readonly prisma: PrismaService,
  ) {}

  @Query(() => RecipientCountResponse)
  async getRecipientCount(
    @Args('input') input: GetRecipientCountInput,
  ): Promise<RecipientCountResponse> {
    return this.recipientService.getRecipientCount(input);
  }

  @Query(() => [RecipientGroup])
  async recipientGroups(
    @Args('organisationId', { type: () => String, nullable: true })
    organisationId?: string,
    @Args('branchId', { type: () => String, nullable: true })
    branchId?: string,
  ): Promise<RecipientGroup[]> {
    // Build filter conditions
    const whereConditions: any = {};
    if (organisationId) {
      whereConditions.organisationId = organisationId;
    }
    if (branchId) {
      whereConditions.branchId = branchId;
    }

    // Fetch ministries and small groups with filtering
    const ministries = await this.prisma.ministry.findMany({
      where: whereConditions,
      select: { id: true, name: true },
    });
    const smallGroups = await this.prisma.smallGroup.findMany({
      where: whereConditions,
      select: { id: true, name: true },
    });

    return [
      ...ministries.map((m) => ({ ...m, type: 'MINISTRY' })),
      ...smallGroups.map((g) => ({ ...g, type: 'SMALL_GROUP' })),
    ];
  }
}
