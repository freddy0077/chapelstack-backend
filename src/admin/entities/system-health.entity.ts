import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { GraphQLISODateTime } from '@nestjs/graphql';

@ObjectType()
export class DatabaseHealth {
  @Field(() => String)
  status: string;

  @Field(() => Int)
  latency: number;
}

@ObjectType()
export class MemoryUsage {
  @Field(() => Float)
  rss: number;

  @Field(() => Float)
  heapTotal: number;

  @Field(() => Float)
  heapUsed: number;

  @Field(() => Float)
  external: number;
}

@ObjectType()
export class CpuUsage {
  @Field(() => Float)
  user: number;

  @Field(() => Float)
  system: number;
}

@ObjectType()
export class SystemInfo {
  @Field(() => Float)
  totalMemory: number;

  @Field(() => Float)
  freeMemory: number;

  @Field(() => MemoryUsage)
  memoryUsage: MemoryUsage;

  @Field(() => CpuUsage)
  cpuUsage: CpuUsage;

  @Field(() => Float)
  systemUptime: number;

  @Field(() => Float)
  processUptime: number;

  @Field(() => String)
  platform: string;

  @Field(() => String)
  nodeVersion: string;
}

@ObjectType()
export class SystemHealth {
  @Field(() => GraphQLISODateTime)
  timestamp: Date;

  @Field(() => DatabaseHealth)
  database: DatabaseHealth;

  @Field(() => SystemInfo)
  system: SystemInfo;
}
