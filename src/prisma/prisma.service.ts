import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      // Optional: you can pass Prisma Client options here, for example, logging.
      // log: [
      //   { emit: 'stdout', level: 'query' },
      //   { emit: 'stdout', level: 'info' },
      //   { emit: 'stdout', level: 'warn' },
      //   { emit: 'stdout', level: 'error' },
      // ],
    });
  }

  async onModuleInit() {
    // This is optional if you're not doing anything specific on connect,
    // as Prisma Client connects lazily on the first query.
    // However, explicitly connecting can help catch connection issues early.
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
