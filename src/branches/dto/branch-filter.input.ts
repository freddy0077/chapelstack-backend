import { InputType, Field } from '@nestjs/graphql';
import { IsOptional, IsString, IsBoolean, MaxLength } from 'class-validator';

@InputType()
export class BranchFilterInput {
  @Field({
    nullable: true,
    description: 'Filter by name (case-insensitive, partial match)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  nameContains?: string;

  @Field({
    nullable: true,
    description: 'Filter by city (case-insensitive, partial match)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  cityContains?: string;

  @Field({
    nullable: true,
    description: 'Filter by state (case-insensitive, partial match)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  stateContains?: string;

  @Field({
    nullable: true,
    description: 'Filter by country (case-insensitive, partial match)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  countryContains?: string;

  @Field({ nullable: true, description: 'Filter by active status' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @Field({
    nullable: true,
    description: 'Filter by email (case-insensitive, partial match)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  emailContains?: string;

  @Field({ nullable: true, description: 'Filter by branch ID' })
  @IsOptional()
  @IsString()
  id?: string;

  @Field({ nullable: true, description: 'Filter by organisation ID' })
  @IsOptional()
  @IsString()
  organisationId?: string;
}
