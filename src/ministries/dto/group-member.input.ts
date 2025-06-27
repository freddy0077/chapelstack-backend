import { Field, ID, InputType } from '@nestjs/graphql';
import { IsEnum, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export enum GroupMemberRole {
  LEADER = 'LEADER',
  CO_LEADER = 'CO_LEADER',
  MEMBER = 'MEMBER',
}

export enum GroupMemberStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

@InputType()
export class AddMemberToGroupInput {
  @Field(() => ID)
  @IsUUID()
  @IsNotEmpty()
  memberId: string;

  @Field(() => ID, { nullable: true })
  @IsUUID()
  @IsOptional()
  ministryId?: string;

  @Field(() => ID, { nullable: true })
  @IsUUID()
  @IsOptional()
  smallGroupId?: string;

  @Field({ defaultValue: GroupMemberRole.MEMBER })
  @IsEnum(GroupMemberRole)
  @IsNotEmpty()
  role: string;

  @Field({ defaultValue: GroupMemberStatus.ACTIVE })
  @IsEnum(GroupMemberStatus)
  @IsNotEmpty()
  status: string;
}

@InputType()
export class UpdateGroupMemberInput {
  @Field({ nullable: true })
  @IsEnum(GroupMemberRole)
  @IsOptional()
  role?: string;

  @Field({ nullable: true })
  @IsEnum(GroupMemberStatus)
  @IsOptional()
  status?: string;
}

@InputType()
export class GroupMemberFilterInput {
  @Field(() => ID, { nullable: true })
  @IsUUID()
  @IsOptional()
  id?: string;

  @Field(() => ID, { nullable: true })
  @IsUUID()
  @IsOptional()
  memberId?: string;

  @Field(() => ID, { nullable: true })
  @IsUUID()
  @IsOptional()
  ministryId?: string;

  @Field(() => ID, { nullable: true })
  @IsUUID()
  @IsOptional()
  smallGroupId?: string;

  @Field({ nullable: true })
  @IsEnum(GroupMemberRole)
  @IsOptional()
  role?: string;

  @Field({ nullable: true })
  @IsEnum(GroupMemberStatus)
  @IsOptional()
  status?: string;
}
