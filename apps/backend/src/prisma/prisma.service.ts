import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    try {
      await this.$connect();
    } catch (err) {
      console.warn('⚠️ Warning: Prisma could not connect to PostgreSQL. Verify DATABASE_URL if database is required.');
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
