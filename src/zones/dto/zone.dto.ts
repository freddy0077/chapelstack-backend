import { InputType, Field, ObjectType, Int } from '@nestjs/graphql';
import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

@InputType()
export class CreateZoneInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  location?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  leaderName?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  leaderPhone?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  leaderEmail?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  branchId?: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  organisationId: string;
}

@InputType()
export class UpdateZoneInput {
  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => String, { nullable: true })
  location?: string;

  @Field(() => String, { nullable: true })
  leaderName?: string;

  @Field(() => String, { nullable: true })
  leaderPhone?: string;

  @Field(() => String, { nullable: true })
  leaderEmail?: string;

  @Field(() => String, { nullable: true })
  status?: string;
}

@ObjectType()
export class ZoneMemberCount {
  @Field(() => Int)
  members: number;
}

@ObjectType()
export class Zone {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field(() => String, { nullable: true })
  description?: string | null;

  @Field(() => String, { nullable: true })
  location?: string | null;

  @Field(() => String, { nullable: true })
  leaderName?: string | null;

  @Field(() => String, { nullable: true })
  leaderPhone?: string | null;

  @Field(() => String, { nullable: true })
  leaderEmail?: string | null;

  @Field()
  status: string;

  @Field(() => String, { nullable: true })
  branchId?: string | null;

  @Field(() => String, { nullable: true })
  organisationId?: string | null;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => ZoneMemberCount, { nullable: true })
  _count?: ZoneMemberCount;
}

@ObjectType()
export class ZoneStatsItem {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field(() => Int)
  memberCount: number;

  @Field()
  status: string;
}

@ObjectType()
export class ZoneStats {
  @Field(() => Int)
  totalZones: number;

  @Field(() => Int)
  activeZones: number;

  @Field(() => Int)
  totalMembers: number;

  @Field(() => [ZoneStatsItem])
  zones: ZoneStatsItem[];
}
