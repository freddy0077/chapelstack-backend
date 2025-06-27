import { Resolver, ResolveField, Parent } from '@nestjs/graphql';
import { Member } from '../entities/member.entity';
import { Family } from '../entities/family.entity';
import { FamiliesService } from '../services/families.service';

@Resolver(() => Member)
export class MemberResolver {
  constructor(private readonly familiesService: FamiliesService) {}

  @ResolveField(() => [Family], { nullable: true })
  async families(@Parent() member: Member): Promise<Family[]> {
    // You may want to optimize this or use a dedicated service method
    return this.familiesService.findFamiliesByMemberId(member.id);
  }
}
