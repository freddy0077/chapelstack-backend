import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { FamiliesService } from '../services/families.service';
import { Family, FamilyRelationship } from '../entities/family.entity';
import { CreateFamilyInput } from '../dto/create-family.input';
import { UpdateFamilyInput } from '../dto/update-family.input';
import { CreateFamilyRelationshipInput } from '../dto/create-family-relationship.input';
import { UpdateFamilyRelationshipInput } from '../dto/update-family-relationship.input';
import { ParseUUIDPipe } from '@nestjs/common';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { IpAddress, UserAgent } from '../../common/decorators';

@Resolver(() => Family)
export class FamiliesResolver {
  constructor(private readonly familiesService: FamiliesService) {}

  @Mutation(() => Family)
  async createFamily(
    @Args('createFamilyInput') createFamilyInput: CreateFamilyInput,
    @CurrentUser() userId?: string,
    @IpAddress() ipAddress?: string,
    @UserAgent() userAgent?: string,
  ): Promise<Family> {
    return this.familiesService.createFamily(
      createFamilyInput,
      userId,
      ipAddress,
      userAgent,
    );
  }

  @Query(() => [Family], { name: 'families' })
  async findAllFamilies(
    @Args('skip', { type: () => Int, nullable: true, defaultValue: 0 })
    skip: number,
    @Args('take', { type: () => Int, nullable: true, defaultValue: 10 })
    take: number,
  ): Promise<Family[]> {
    return this.familiesService.findAllFamilies(skip, take);
  }

  @Query(() => Family, { name: 'family' })
  async findFamilyById(
    @Args('id', { type: () => String }, ParseUUIDPipe) id: string,
  ): Promise<Family> {
    return this.familiesService.findFamilyById(id);
  }

  @Mutation(() => Family)
  async updateFamily(
    @Args('id', { type: () => String }, ParseUUIDPipe) id: string,
    @Args('updateFamilyInput') updateFamilyInput: UpdateFamilyInput,
    @CurrentUser() userId?: string,
    @IpAddress() ipAddress?: string,
    @UserAgent() userAgent?: string,
  ): Promise<Family> {
    return this.familiesService.updateFamily(
      id,
      updateFamilyInput,
      userId,
      ipAddress,
      userAgent,
    );
  }

  @Mutation(() => Boolean)
  async removeFamily(
    @Args('id', { type: () => String }, ParseUUIDPipe) id: string,
    @Args('relationship', { type: () => String }) relationship: string,
  ): Promise<boolean> {
    return this.familiesService.removeFamily(id, relationship);
  }

  @Mutation(() => Family)
  async addMemberToFamily(
    @Args('familyId', { type: () => String }, ParseUUIDPipe) familyId: string,
    @Args('memberId', { type: () => String }, ParseUUIDPipe) memberId: string,
    @CurrentUser() userId?: string,
    @IpAddress() ipAddress?: string,
    @UserAgent() userAgent?: string,
  ): Promise<Family> {
    return this.familiesService.addMemberToFamily(
      familyId,
      memberId,
      userId,
      ipAddress,
      userAgent,
    );
  }

  @Mutation(() => Family)
  async removeMemberFromFamily(
    @Args('familyId', { type: () => String }, ParseUUIDPipe) familyId: string,
    @Args('memberId', { type: () => String }, ParseUUIDPipe) memberId: string,
    @CurrentUser() userId?: string,
    @IpAddress() ipAddress?: string,
    @UserAgent() userAgent?: string,
  ): Promise<Family> {
    return this.familiesService.removeMemberFromFamily(
      familyId,
      memberId,
      userId,
      ipAddress,
      userAgent,
    );
  }

  @Query(() => Int, { name: 'familiesCount' })
  async countFamilies(): Promise<number> {
    return this.familiesService.countFamilies();
  }

  @Mutation(() => FamilyRelationship)
  async createFamilyRelationship(
    @Args('createFamilyRelationshipInput')
    createFamilyRelationshipInput: CreateFamilyRelationshipInput,
    @CurrentUser() userId?: string,
    @IpAddress() ipAddress?: string,
    @UserAgent() userAgent?: string,
  ): Promise<FamilyRelationship> {
    return this.familiesService.createFamilyRelationship(
      createFamilyRelationshipInput,
      userId,
      ipAddress,
      userAgent,
    );
  }

  @Query(() => [FamilyRelationship], { name: 'familyRelationships' })
  async findAllFamilyRelationships(
    @Args('skip', { type: () => Int, nullable: true, defaultValue: 0 })
    skip: number,
    @Args('take', { type: () => Int, nullable: true, defaultValue: 10 })
    take: number,
  ): Promise<FamilyRelationship[]> {
    return this.familiesService.findAllFamilyRelationships(skip, take);
  }

  @Query(() => FamilyRelationship, { name: 'familyRelationship' })
  async findFamilyRelationshipById(
    @Args('id', { type: () => String }, ParseUUIDPipe) id: string,
  ): Promise<FamilyRelationship> {
    return this.familiesService.findFamilyRelationshipById(id);
  }

  @Query(() => [FamilyRelationship], { name: 'familyRelationshipsByMember' })
  async findFamilyRelationshipsByMember(
    @Args('memberId', { type: () => String }, ParseUUIDPipe) memberId: string,
  ): Promise<FamilyRelationship[]> {
    return this.familiesService.findFamilyRelationshipsByMember(memberId);
  }

  @Mutation(() => FamilyRelationship)
  async updateFamilyRelationship(
    @Args('id', { type: () => String }, ParseUUIDPipe) id: string,
    @Args('updateFamilyRelationshipInput')
    updateFamilyRelationshipInput: UpdateFamilyRelationshipInput,
    @CurrentUser() userId?: string,
    @IpAddress() ipAddress?: string,
    @UserAgent() userAgent?: string,
  ): Promise<FamilyRelationship> {
    return this.familiesService.updateFamilyRelationship(
      id,
      updateFamilyRelationshipInput,
      userId,
      ipAddress,
      userAgent,
    );
  }

  @Mutation(() => Boolean)
  async removeFamilyRelationship(
    @Args('id', { type: () => String }, ParseUUIDPipe) id: string,
    @CurrentUser() userId?: string,
    @IpAddress() ipAddress?: string,
    @UserAgent() userAgent?: string,
  ): Promise<boolean> {
    return this.familiesService.removeFamilyRelationship(
      id,
      userId,
      ipAddress,
      userAgent,
    );
  }

  @Query(() => Int, { name: 'familyRelationshipsCount' })
  async countFamilyRelationships(): Promise<number> {
    return this.familiesService.countFamilyRelationships();
  }

  @Mutation(() => Family)
  async addMemberToFamilyByRfidCard(
    @Args('rfidCardId', { type: () => String }) rfidCardId: string,
    @Args('familyId', { type: () => String }) familyId: string,
    @Args('relatedMemberId', { type: () => String }) relatedMemberId: string,
    @Args('relationship', { type: () => String }) relationship: string,
    @CurrentUser() userId?: string,
    @IpAddress() ipAddress?: string,
    @UserAgent() userAgent?: string,
  ): Promise<Family> {
    return this.familiesService.addMemberToFamilyByRfidCard(
      rfidCardId,
      familyId,
      relatedMemberId,
      relationship,
    );
  }

  @Mutation(() => Family)
  async addFamilyConnection(
    @Args('familyId', { type: () => String }, ParseUUIDPipe) familyId: string,
    @Args('memberId', { type: () => String }, ParseUUIDPipe) memberId: string,
    @Args('relatedMemberId', { type: () => String }, ParseUUIDPipe)
    relatedMemberId: string,
    @Args('relationship', { type: () => String }) relationship: string,
    @CurrentUser() userId?: string,
    @IpAddress() ipAddress?: string,
    @UserAgent() userAgent?: string,
  ): Promise<Family> {
    return this.familiesService.addFamilyConnection(
      familyId,
      memberId,
      relatedMemberId,
      relationship,
      userId,
      ipAddress,
      userAgent,
    );
  }
}
