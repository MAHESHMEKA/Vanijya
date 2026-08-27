import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  public isConnected: boolean = false;

  async onModuleInit() {
    try {
      await this.$connect();
      this.isConnected = true;
      console.log('✅ PostgreSQL Database connected successfully via Prisma.');
    } catch (err) {
      this.isConnected = false;
      console.warn('⚠️ Warning: Prisma could not connect to PostgreSQL. Operating in resilient In-Memory Store Mode.');
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
    } catch (e) {}
  }
}
