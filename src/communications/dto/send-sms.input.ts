import { Field, InputType } from '@nestjs/graphql';
import {
  IsArray,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUUID,
} from 'class-validator';

@InputType()
export class SendSmsInput {
  @Field(() => [String])
  @IsArray()
  @IsPhoneNumber(undefined, { each: true })
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
}
