import { Field, InputType } from '@nestjs/graphql';
import {
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
  IsDateString,
} from 'class-validator';
import { BirthdayRangeEnum } from './member-filter.input';

@InputType()
export class SendSmsInput {
  @Field(() => [String])
  @IsArray()
  @IsUUID('all', { each: true })
  recipients: string[];

  @Field()
  @IsString()
  message: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  organisationId?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  groupIds?: string[];

  @Field(() => BirthdayRangeEnum, { nullable: true })
  @IsOptional()
  birthdayRange?: BirthdayRangeEnum;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @Field(() => [String], {
    nullable: true,
    description:
      'Advanced recipient filters such as "all-members", "volunteers", etc.',
  })
  @IsOptional()
  filters?: string[];
}
