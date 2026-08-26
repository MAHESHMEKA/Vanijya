import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CropsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.crop.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const crop = await this.prisma.crop.findUnique({
      where: { id },
      include: {
        mandiPrices: {
          take: 10,
          orderBy: { date: 'desc' },
          include: { market: true },
        },
      },
    });

    if (!crop) {
      throw new NotFoundException(`Crop with ID ${id} not found.`);
    }

    return crop;
  }
}
