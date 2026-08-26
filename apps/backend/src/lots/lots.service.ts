import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCropLotDto, UpdateCropLotDto, QueryLotsDto } from './dto/create-lot.dto';
import { CropLotStatus, Role } from '@prisma/client';

@Injectable()
export class LotsService {
  constructor(private prisma: PrismaService) {}

  async create(farmerId: string, dto: CreateCropLotDto) {
    const crop = await this.prisma.crop.findUnique({ where: { id: dto.cropId } });
    if (!crop) {
      throw new NotFoundException(`Crop with ID ${dto.cropId} does not exist.`);
    }

    return this.prisma.cropLot.create({
      data: {
        farmerId,
        cropId: dto.cropId,
        quantity: dto.quantity,
        unit: dto.unit || 'QUINTAL',
        expectedPrice: dto.expectedPrice,
        qualityGrade: dto.qualityGrade,
        location: dto.location,
        harvestDate: dto.harvestDate ? new Date(dto.harvestDate) : new Date(),
        status: CropLotStatus.OPEN,
      },
      include: {
        crop: true,
        farmer: {
          select: {
            id: true,
            name: true,
            phone: true,
            district: true,
            state: true,
            isVerified: true,
          },
        },
      },
    });
  }

  async findAll(query: QueryLotsDto) {
    const where: any = {};
    if (query.cropId) where.cropId = query.cropId;
    if (query.farmerId) where.farmerId = query.farmerId;
    if (query.status) where.status = query.status;
    if (query.qualityGrade) where.qualityGrade = query.qualityGrade;
    if (query.location) where.location = { contains: query.location, mode: 'insensitive' };

    return this.prisma.cropLot.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        crop: true,
        farmer: {
          select: {
            id: true,
            name: true,
            phone: true,
            district: true,
            state: true,
            isVerified: true,
          },
        },
        _count: {
          select: { bids: true },
        },
      },
    });
  }

  async findOne(id: string) {
    const lot = await this.prisma.cropLot.findUnique({
      where: { id },
      include: {
        crop: true,
        farmer: {
          select: {
            id: true,
            name: true,
            phone: true,
            district: true,
            state: true,
            isVerified: true,
          },
        },
        bids: {
          orderBy: { price: 'desc' },
          include: {
            buyer: {
              select: {
                id: true,
                name: true,
                district: true,
                state: true,
                isVerified: true,
              },
            },
          },
        },
        transaction: {
          include: { payment: true },
        },
      },
    });

    if (!lot) {
      throw new NotFoundException(`Crop Lot with ID ${id} not found.`);
    }

    return lot;
  }

  async update(lotId: string, userId: string, userRole: Role, dto: UpdateCropLotDto) {
    const lot = await this.prisma.cropLot.findUnique({ where: { id: lotId } });
    if (!lot) {
      throw new NotFoundException(`Crop Lot with ID ${lotId} not found.`);
    }

    // Authorization: only owner farmer or admin
    if (lot.farmerId !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenException('You are not authorized to modify this lot.');
    }

    // Business Rule: Can only edit while OPEN
    if (lot.status === CropLotStatus.SOLD) {
      throw new BadRequestException('Sold lots cannot be modified.');
    }

    return this.prisma.cropLot.update({
      where: { id: lotId },
      data: dto,
      include: {
        crop: true,
        farmer: true,
      },
    });
  }

  async cancel(lotId: string, userId: string, userRole: Role) {
    const lot = await this.prisma.cropLot.findUnique({
      where: { id: lotId },
      include: { bids: true },
    });

    if (!lot) {
      throw new NotFoundException(`Crop Lot with ID ${lotId} not found.`);
    }

    if (lot.farmerId !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenException('You are not authorized to cancel this lot.');
    }

    if (lot.status === CropLotStatus.SOLD) {
      throw new BadRequestException('A sold lot cannot be cancelled.');
    }

    return this.prisma.cropLot.update({
      where: { id: lotId },
      data: { status: CropLotStatus.CANCELLED },
    });
  }
}
