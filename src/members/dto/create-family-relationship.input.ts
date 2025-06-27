import { InputType, Field, ID } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { FamilyRelationshipType } from '../entities/family.entity';
import { IsValidEnum } from '../../common/utils/enum-validation.util';

@InputType()
export class CreateFamilyRelationshipInput {
  @Field(() => ID)
  @IsNotEmpty()
  @IsUUID()
  memberId: string;

  @Field(() => ID)
  @IsNotEmpty()
  @IsUUID()
  relatedMemberId: string;

  @Field(() => FamilyRelationshipType)
  @IsNotEmpty()
  @IsValidEnum(FamilyRelationshipType)
  relationshipType: FamilyRelationshipType;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  familyId?: string;
}
