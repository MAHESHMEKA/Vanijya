import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MarketsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.market.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const market = await this.prisma.market.findUnique({
      where: { id },
      include: {
        mandiPrices: {
          take: 10,
          orderBy: { date: 'desc' },
          include: { crop: true },
        },
      },
    });

    if (!market) {
      throw new NotFoundException(`Market APMC with ID ${id} not found.`);
    }

    return market;
  }
}
