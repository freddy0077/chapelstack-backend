import { InputType, Field, ID } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

@InputType()
export class CreateSettingInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  key: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  value: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  branchId?: string | null;
}
