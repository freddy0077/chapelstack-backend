import { Field, ID, InputType } from '@nestjs/graphql';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { GroupExecutiveRole } from '../enums/group-executive-role.enum';
import { GroupExecutiveStatus } from '../enums/group-executive-status.enum';

@InputType()
export class CreateGroupExecutiveInput {
  @Field()
  @IsEnum(GroupExecutiveRole)
  @IsNotEmpty()
  role: string;

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
}

@InputType()
export class UpdateGroupExecutiveInput {
  @Field({ nullable: true })
  @IsEnum(GroupExecutiveRole)
  @IsOptional()
  role?: string;

  @Field({ nullable: true })
  @IsEnum(GroupExecutiveStatus)
  @IsOptional()
  status?: string;
}

@InputType()
export class GroupExecutiveFilterInput {
  @Field(() => ID, { nullable: true })
  @IsUUID()
  @IsOptional()
  id?: string;

  @Field({ nullable: true })
  @IsEnum(GroupExecutiveRole)
  @IsOptional()
  role?: string;

  @Field({ nullable: true })
  @IsEnum(GroupExecutiveStatus)
  @IsOptional()
  status?: string;

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
}
