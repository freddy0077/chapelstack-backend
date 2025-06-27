import { InputType, Field, ID } from '@nestjs/graphql';
import { IsOptional, IsString, IsUUID, IsBoolean } from 'class-validator';

@InputType()
export class UserFilterInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  emailContains?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  nameContains?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  roleId?: string;
}
