import { InputType, Field } from '@nestjs/graphql';
import {
  IsArray,
  IsEnum,
  IsString,
  IsUUID,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { MemberStatus } from '../entities/member.entity';
import { MemberFiltersInput } from './member-filters.input';

@InputType()
export class BulkUpdateStatusInput {
  @Field(() => [String])
  @IsArray()
  @IsUUID('4', { each: true })
  memberIds: string[];

  @Field(() => MemberStatus)
  @IsEnum(MemberStatus)
  status: MemberStatus;
}

@InputType()
export class BulkTransferInput {
  @Field(() => [String])
  @IsArray()
  @IsUUID('4', { each: true })
  memberIds: string[];

  @Field(() => String)
  @IsUUID()
  newBranchId: string;
}

@InputType()
export class BulkDeactivateInput {
  @Field(() => [String])
  @IsArray()
  @IsUUID('4', { each: true })
  memberIds: string[];
}

@InputType()
export class BulkAssignRfidInput {
  @Field(() => [String])
  @IsArray()
  @IsUUID('4', { each: true })
  memberIds: string[];
}

@InputType()
export class BulkAddToGroupInput {
  @Field(() => [String])
  @IsUUID('4', { each: true })
  memberIds: string[];

  @Field()
  @IsUUID('4')
  groupId: string;
}

@InputType()
export class BulkRemoveFromGroupInput {
  @Field(() => [String])
  @IsUUID('4', { each: true })
  memberIds: string[];

  @Field()
  @IsUUID('4')
  groupId: string;
}

@InputType()
export class BulkAddToMinistryInput {
  @Field(() => [String])
  @IsUUID('4', { each: true })
  memberIds: string[];

  @Field()
  @IsUUID('4')
  ministryId: string;
}

@InputType()
export class BulkRemoveFromMinistryInput {
  @Field(() => [String])
  @IsUUID('4', { each: true })
  memberIds: string[];

  @Field()
  @IsUUID('4')
  ministryId: string;
}

@InputType()
export class BulkExportInput {
  // Support both member IDs and filter-based exports
  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  memberIds?: string[];

  @Field(() => MemberFiltersInput, { nullable: true })
  @IsOptional()
  filters?: MemberFiltersInput;

  @Field(() => String, { nullable: true, defaultValue: 'CSV' })
  @IsOptional()
  @IsEnum(['CSV', 'EXCEL', 'PDF'])
  format?: 'CSV' | 'EXCEL' | 'PDF';

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  fields?: string[];

  @Field(() => Boolean, { nullable: true, defaultValue: true })
  @IsOptional()
  @IsBoolean()
  includeHeaders?: boolean;

  @Field(() => Boolean, { nullable: true, defaultValue: false })
  @IsOptional()
  @IsBoolean()
  includeImages?: boolean;
}
