import { Test, TestingModule } from '@nestjs/testing';
import { BidsService } from './bids.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { BidStatus, CropLotStatus, PaymentStatus, Role, TransactionStatus, AuditAction } from '@prisma/client';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';

describe('BidsService', () => {
  let service: BidsService;
  let prisma: PrismaService;
  let audit: AuditService;

  const mockPrismaService = {
    isConnected: true,
    cropLot: {
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    bid: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      count: jest.fn(),
    },
    transaction: {
      create: jest.fn(),
    },
    payment: {
      create: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mockAuditService = {
    log: jest.fn().mockResolvedValue({ id: 'audit-1' }),
    getRecent: jest.fn().mockResolvedValue([]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BidsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: AuditService, useValue: mockAuditService },
      ],
    }).compile();

    service = module.get<BidsService>(BidsService);
    prisma = module.get<PrismaService>(PrismaService);
    audit = module.get<AuditService>(AuditService);
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

  describe('updateBidQuantity', () => {
    it('should reject modification from non-owner buyer', async () => {
      mockPrismaService.bid.findUnique.mockResolvedValue({
        id: 'bid-1',
        buyerId: 'buyer-1',
        status: BidStatus.PENDING,
        lot: { id: 'lot-1', quantity: 100, unit: 'QUINTAL', status: CropLotStatus.OPEN },
      });

      await expect(
        service.updateBidQuantity('bid-1', 'buyer-2', Role.BUYER, 60),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should reject quantity modification exceeding available lot quantity', async () => {
      mockPrismaService.bid.findUnique.mockResolvedValue({
        id: 'bid-1',
        buyerId: 'buyer-1',
        quantity: 80,
        status: BidStatus.PENDING,
        lot: { id: 'lot-1', quantity: 100, unit: 'QUINTAL', status: CropLotStatus.OPEN },
      });

      await expect(
        service.updateBidQuantity('bid-1', 'buyer-1', Role.BUYER, 120),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject modification of non-pending bids', async () => {
      mockPrismaService.bid.findUnique.mockResolvedValue({
        id: 'bid-1',
        buyerId: 'buyer-1',
        quantity: 80,
        status: BidStatus.ACCEPTED,
        lot: { id: 'lot-1', quantity: 100, unit: 'QUINTAL', status: CropLotStatus.SOLD },
      });

      await expect(
        service.updateBidQuantity('bid-1', 'buyer-1', Role.BUYER, 60),
      ).rejects.toThrow(BadRequestException);
    });

    it('should allow valid quantity reduction and update bid', async () => {
      mockPrismaService.bid.findUnique.mockResolvedValue({
        id: 'bid-1',
        buyerId: 'buyer-1',
        lotId: 'lot-1',
        quantity: 80,
        price: 2250,
        status: BidStatus.PENDING,
        lot: { id: 'lot-1', quantity: 100, unit: 'QUINTAL', status: CropLotStatus.OPEN, crop: { name: 'Tomato' } },
      });

      mockPrismaService.bid.update.mockResolvedValue({
        id: 'bid-1',
        buyerId: 'buyer-1',
        quantity: 60,
        price: 2250,
        status: BidStatus.PENDING,
      });

      const updated = await service.updateBidQuantity('bid-1', 'buyer-1', Role.BUYER, 60);
      expect(updated.quantity).toBe(60);
      expect(mockAuditService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: AuditAction.QUANTITY_MODIFIED,
          oldQuantity: 80,
          newQuantity: 60,
        }),
      );
    });
  });

  describe('cancelBid', () => {
    it('should reject cancellation by unauthorized user', async () => {
      mockPrismaService.bid.findUnique.mockResolvedValue({
        id: 'bid-1',
        buyerId: 'buyer-1',
        status: BidStatus.PENDING,
        lot: { id: 'lot-1', status: CropLotStatus.OPEN },
      });

      await expect(
        service.cancelBid('bid-1', 'other-buyer', Role.BUYER),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should reject cancellation of an already accepted bid', async () => {
      mockPrismaService.bid.findUnique.mockResolvedValue({
        id: 'bid-1',
        buyerId: 'buyer-1',
        status: BidStatus.ACCEPTED,
        lot: { id: 'lot-1', status: CropLotStatus.SOLD },
      });

      await expect(
        service.cancelBid('bid-1', 'buyer-1', Role.BUYER),
      ).rejects.toThrow(BadRequestException);
    });

    it('should mark pending bid as WITHDRAWN and log audit record', async () => {
      mockPrismaService.bid.findUnique.mockResolvedValue({
        id: 'bid-1',
        buyerId: 'buyer-1',
        lotId: 'lot-1',
        price: 2250,
        quantity: 100,
        status: BidStatus.PENDING,
        lot: { id: 'lot-1', status: CropLotStatus.BIDDING, crop: { name: 'Tomato' } },
      });

      mockPrismaService.bid.update.mockResolvedValue({
        id: 'bid-1',
        buyerId: 'buyer-1',
        status: BidStatus.WITHDRAWN,
      });

      mockPrismaService.bid.count.mockResolvedValue(0);

      const result = await service.cancelBid('bid-1', 'buyer-1', Role.BUYER);
      expect(result.status).toBe(BidStatus.WITHDRAWN);
      expect(mockAuditService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: AuditAction.BID_CANCELLED,
          oldStatus: BidStatus.PENDING,
          newStatus: BidStatus.WITHDRAWN,
        }),
      );
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
