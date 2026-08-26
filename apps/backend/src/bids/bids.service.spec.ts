import { Test, TestingModule } from '@nestjs/testing';
import { BidsService } from './bids.service';
import { PrismaService } from '../prisma/prisma.service';
import { BidStatus, CropLotStatus, PaymentStatus, Role, TransactionStatus } from '@prisma/client';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';

describe('BidsService', () => {
  let service: BidsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    cropLot: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    bid: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    transaction: {
      create: jest.fn(),
    },
    payment: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BidsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<BidsService>(BidsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createBid', () => {
    it('should reject self-bidding (farmer bidding on own lot)', async () => {
      mockPrismaService.cropLot.findUnique.mockResolvedValue({
        id: 'lot-1',
        farmerId: 'farmer-1',
        status: CropLotStatus.OPEN,
        quantity: 50,
      });

      await expect(
        service.createBid('lot-1', 'farmer-1', { price: 2300, quantity: 50 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject bids with quantity exceeding lot available limit', async () => {
      mockPrismaService.cropLot.findUnique.mockResolvedValue({
        id: 'lot-1',
        farmerId: 'farmer-1',
        status: CropLotStatus.OPEN,
        quantity: 50,
        unit: 'QUINTAL',
      });

      await expect(
        service.createBid('lot-1', 'buyer-1', { price: 2300, quantity: 100 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject bids on already SOLD lots', async () => {
      mockPrismaService.cropLot.findUnique.mockResolvedValue({
        id: 'lot-1',
        farmerId: 'farmer-1',
        status: CropLotStatus.SOLD,
        quantity: 50,
      });

      await expect(
        service.createBid('lot-1', 'buyer-1', { price: 2300, quantity: 50 }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('acceptBid', () => {
    it('should reject bid acceptance from non-owner', async () => {
      mockPrismaService.bid.findUnique.mockResolvedValue({
        id: 'bid-1',
        lotId: 'lot-1',
        status: BidStatus.PENDING,
        lot: { farmerId: 'farmer-1' },
      });

      await expect(
        service.acceptBid('bid-1', 'other-user', Role.FARMER),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
