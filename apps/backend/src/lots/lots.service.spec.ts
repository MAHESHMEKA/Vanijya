import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { LotsService } from './lots.service';
import { AuditService } from '../audit/audit.service';
import { UsersService } from '../users/users.service';
import {
  CropLot,
  Crop,
  User,
  Bid,
  Transaction,
  Payment,
  CropLotStatus,
  QualityGrade,
  Role,
} from '../database/schemas';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';

describe('LotsService', () => {
  let service: LotsService;

  const mockCropLotModel = {
    create: jest.fn(),
    find: jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([]),
      }),
      lean: jest.fn().mockResolvedValue([]),
    }),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  };

  const mockCropModel = {
    findById: jest.fn().mockReturnValue({
      lean: jest.fn().mockResolvedValue({ _id: 'crop-1', name: 'Tomato' }),
    }),
    find: jest.fn().mockReturnValue({
      lean: jest.fn().mockResolvedValue([]),
    }),
  };

  const mockUserModel = {
    findById: jest.fn().mockReturnValue({
      lean: jest.fn().mockResolvedValue({ _id: 'farmer-1', name: 'Ramesh' }),
    }),
    find: jest.fn().mockReturnValue({
      lean: jest.fn().mockResolvedValue([]),
    }),
  };

  const mockBidModel = {
    find: jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([]),
      }),
      lean: jest.fn().mockResolvedValue([]),
    }),
  };

  const mockTransactionModel = {
    findOne: jest.fn().mockReturnValue({
      lean: jest.fn().mockResolvedValue(null),
    }),
    find: jest.fn().mockReturnValue({
      lean: jest.fn().mockResolvedValue([]),
    }),
  };

  const mockPaymentModel = {
    findOne: jest.fn().mockReturnValue({
      lean: jest.fn().mockResolvedValue(null),
    }),
    find: jest.fn().mockReturnValue({
      lean: jest.fn().mockResolvedValue([]),
    }),
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
        { provide: getModelToken(CropLot.name), useValue: mockCropLotModel },
        { provide: getModelToken(Crop.name), useValue: mockCropModel },
        { provide: getModelToken(User.name), useValue: mockUserModel },
        { provide: getModelToken(Bid.name), useValue: mockBidModel },
        { provide: getModelToken(Transaction.name), useValue: mockTransactionModel },
        { provide: getModelToken(Payment.name), useValue: mockPaymentModel },
        { provide: AuditService, useValue: mockAuditService },
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    service = module.get<LotsService>(LotsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a crop lot for authenticated farmer', async () => {
      mockCropModel.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue({ _id: 'crop-tomato', name: 'Tomato' }),
      });
      mockCropLotModel.create.mockResolvedValue({
        toObject: () => ({
          _id: 'lot-1',
          farmerId: 'farmer-1',
          cropId: 'crop-tomato',
          quantity: 50,
          unit: 'QUINTAL',
          expectedPrice: 2200,
          qualityGrade: QualityGrade.GRADE_A,
          location: 'Pimpalgaon, Nashik',
          status: CropLotStatus.OPEN,
        }),
        _id: 'lot-1',
        expectedPrice: 2200,
        quantity: 50,
        location: 'Pimpalgaon, Nashik',
      });

      const result = await service.create('farmer-1', {
        cropId: 'crop-tomato',
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
      mockCropLotModel.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue({
          _id: 'lot-1',
          farmerId: 'farmer-1',
          status: CropLotStatus.OPEN,
        }),
      });

      await expect(
        service.update('lot-1', 'other-farmer', Role.FARMER, { expectedPrice: 2400 }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should reject update if lot is already SOLD', async () => {
      mockCropLotModel.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue({
          _id: 'lot-1',
          farmerId: 'farmer-1',
          status: CropLotStatus.SOLD,
        }),
      });

      await expect(
        service.update('lot-1', 'farmer-1', Role.FARMER, { expectedPrice: 2400 }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
