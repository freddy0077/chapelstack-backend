import { InputType, Field, ID } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

@InputType()
export class CreateRoleInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;
}

@InputType()
export class UpdateRoleInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;
}

@InputType()
export class CreatePermissionInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  action: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  subject: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;
}

@InputType()
export class UpdatePermissionInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  action?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  subject?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;
}

@InputType()
export class CreateRoleWithPermissionsInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => [ID])
  @IsNotEmpty({ each: true })
  @IsUUID('4', { each: true })
  permissionIds: string[];
}
