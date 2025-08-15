import { InputType, Field } from '@nestjs/graphql';
import { IsArray, IsEnum, IsString, IsUUID, IsOptional } from 'class-validator';
import { MemberStatus } from '../entities/member.entity';

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
  @Field(() => [String])
  @IsArray()
  @IsUUID('4', { each: true })
  memberIds: string[];

  @Field(() => String, { nullable: true, defaultValue: 'CSV' })
  @IsOptional()
  @IsEnum(['CSV', 'PDF'])
  format?: 'CSV' | 'PDF';
}
