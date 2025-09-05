import { InputType, Field, ObjectType } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsOptional,
  IsArray,
  ValidateNested,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateMemberInput } from './create-member.input';
import { ImportError } from '../../onboarding/dto/import-result.output';

@InputType()
export class ImportMembersInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  branchId: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  organisationId: string;

  @Field(() => [CreateMemberInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMemberInput)
  members: CreateMemberInput[];

  @Field(() => Boolean, { defaultValue: false })
  @IsOptional()
  @IsBoolean()
  skipDuplicates?: boolean;

  @Field(() => Boolean, { defaultValue: false })
  @IsOptional()
  @IsBoolean()
  updateExisting?: boolean;
}

@ObjectType()
export class ImportMemberResult {
  @Field(() => String, { nullable: true })
  id?: string;

  @Field(() => String)
  firstName: string;

  @Field(() => String)
  lastName: string;

  @Field(() => String, { nullable: true })
  email?: string;

  @Field(() => Boolean)
  success: boolean;

  @Field(() => String, { nullable: true })
  error?: string;

  @Field(() => Number)
  row: number;
}

@ObjectType()
export class ImportMembersResult {
  @Field(() => Number)
  totalProcessed: number;

  @Field(() => Number)
  successCount: number;

  @Field(() => Number)
  errorCount: number;

  @Field(() => Number)
  skippedCount: number;

  @Field(() => [ImportMemberResult])
  results: ImportMemberResult[];

  @Field(() => [ImportError])
  errors: ImportError[];

  @Field(() => String, { nullable: true })
  summary?: string;
}

export { ImportError };
