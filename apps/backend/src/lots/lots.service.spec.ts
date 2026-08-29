import { Test, TestingModule } from '@nestjs/testing';
import { LotsService } from './lots.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { UsersService } from '../users/users.service';
import { CropLotStatus, QualityGrade, Role } from '@prisma/client';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';

describe('LotsService', () => {
  let service: LotsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    isConnected: true,
    crop: {
      findUnique: jest.fn(),
    },
    cropLot: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockAuditService = {
    log: jest.fn().mockResolvedValue({ id: 'audit-1' }),
    getRecent: jest.fn().mockResolvedValue([]),
  };

  const mockUsersService = {
    getProfile: jest.fn().mockResolvedValue({
      id: 'farmer-1',
      name: 'Ramesh Patel',
      role: 'FARMER',
      district: 'Nashik',
      state: 'Maharashtra',
      location: 'Village Pimpalgaon, Nashik',
      profileCompletionStatus: 'COMPLETE',
      profileCompletionPercentage: 100,
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LotsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: AuditService, useValue: mockAuditService },
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    service = module.get<LotsService>(LotsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a crop lot for authenticated farmer', async () => {
      mockPrismaService.crop.findUnique.mockResolvedValue({ id: 'crop-1', name: 'Tomato' });
      mockPrismaService.cropLot.create.mockResolvedValue({
        id: 'lot-1',
        farmerId: 'farmer-1',
        cropId: 'crop-1',
        quantity: 50,
        unit: 'QUINTAL',
        expectedPrice: 2200,
        qualityGrade: QualityGrade.GRADE_A,
        location: 'Pimpalgaon, Nashik',
        status: CropLotStatus.OPEN,
      });

      const result = await service.create('farmer-1', {
        cropId: 'crop-1',
        quantity: 50,
        unit: 'QUINTAL',
        expectedPrice: 2200,
        qualityGrade: QualityGrade.GRADE_A,
        location: 'Pimpalgaon, Nashik',
      });

      expect(result.id).toEqual('lot-1');
      expect(result.status).toEqual(CropLotStatus.OPEN);
      expect(result.expectedPrice).toEqual(2200);
    });

    it('should throw NotFoundException if crop does not exist', async () => {
      mockPrismaService.crop.findUnique.mockResolvedValue(null);

      await expect(
        service.create('farmer-1', {
          cropId: 'invalid-crop',
          quantity: 50,
          expectedPrice: 2200,
          qualityGrade: QualityGrade.GRADE_A,
          location: 'Nashik',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should reject creation if farmer profile is incomplete', async () => {
      mockUsersService.getProfile.mockResolvedValueOnce({
        id: 'farmer-2',
        name: 'Incomplete Farmer',
        role: 'FARMER',
        district: null,
        state: null,
        location: null,
        profileCompletionStatus: 'INCOMPLETE',
        missingFields: ['district', 'state', 'location'],
      });

      await expect(
        service.create('farmer-2', {
          cropId: 'crop-1',
          quantity: 50,
          expectedPrice: 2200,
          qualityGrade: QualityGrade.GRADE_A,
          location: 'Nashik',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('should reject update if user is not the owner farmer', async () => {
      mockPrismaService.cropLot.findUnique.mockResolvedValue({
        id: 'lot-1',
        farmerId: 'farmer-1',
        status: CropLotStatus.OPEN,
      });

      await expect(
        service.update('lot-1', 'other-farmer', Role.FARMER, { expectedPrice: 2400 }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should reject update if lot is already SOLD', async () => {
      mockPrismaService.cropLot.findUnique.mockResolvedValue({
        id: 'lot-1',
        farmerId: 'farmer-1',
        status: CropLotStatus.SOLD,
      });

      await expect(
        service.update('lot-1', 'farmer-1', Role.FARMER, { expectedPrice: 2400 }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
