import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export const FALLBACK_CROPS = [
  { id: 'crop-1', name: 'Tomato', category: 'VEGETABLE', icon: '🍅', mandiPrices: [] },
  { id: 'crop-2', name: 'Onion', category: 'VEGETABLE', icon: '🧅', mandiPrices: [] },
  { id: 'crop-3', name: 'Potato', category: 'VEGETABLE', icon: '🥔', mandiPrices: [] },
  { id: 'crop-4', name: 'Wheat', category: 'GRAIN', icon: '🌾', mandiPrices: [] },
  { id: 'crop-5', name: 'Paddy', category: 'GRAIN', icon: '🍚', mandiPrices: [] },
  { id: 'crop-6', name: 'Maize', category: 'GRAIN', icon: '🌽', mandiPrices: [] },
];

@Injectable()
export class CropsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    if (!this.prisma.isConnected) {
      return FALLBACK_CROPS;
    }
    try {
      return await this.prisma.crop.findMany({
        orderBy: { name: 'asc' },
      });
    } catch (e) {
      return FALLBACK_CROPS;
    }
  }

  async findOne(id: string) {
    if (!this.prisma.isConnected) {
      const found = FALLBACK_CROPS.find(c => c.id === id || c.name.toLowerCase() === id.toLowerCase());
      if (!found) throw new NotFoundException(`Crop with ID ${id} not found.`);
      return found;
    }
    try {
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
    } catch (e) {
      const found = FALLBACK_CROPS.find(c => c.id === id || c.name.toLowerCase() === id.toLowerCase());
      if (found) return found;
      throw new NotFoundException(`Crop with ID ${id} not found.`);
    }
  }
}
