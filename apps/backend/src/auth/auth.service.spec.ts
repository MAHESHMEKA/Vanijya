import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { AuthService } from './auth.service';
import { CaptchaService } from './captcha.service';
import { JwtService } from '@nestjs/jwt';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditService } from '../audit/audit.service';
import { PhotoStorageService } from '../users/photo-storage.service';
import { User, Role, ApprovalStatus, VerificationStatus } from '../database/schemas';
import { BadRequestException, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let captchaService: CaptchaService;

  const mockUserModel = {
    findOne: jest.fn(),
    create: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock-jwt-token'),
  };

  const mockNotificationsService = {
    create: jest.fn().mockResolvedValue({ id: 'notif-1' }),
  };

  const mockAuditService = {
    log: jest.fn().mockResolvedValue({ id: 'audit-1' }),
  };

  const mockPhotoStorageService = {
    storeProfilePhoto: jest.fn().mockResolvedValue({
      url: '/api/users/photo/file-123',
      fileId: 'file-123',
      mimeType: 'image/jpeg',
      size: 1024,
      uploadedAt: new Date(),
    }),
  };

  const mockCaptchaService = {
    isCaptchaEnabled: jest.fn().mockReturnValue(true),
    verifyCaptcha: jest.fn().mockImplementation((captchaId?: string, answer?: string) => {
      if (!captchaId || !answer) {
        return { success: false, error: 'Please enter the CAPTCHA.' };
      }
      if (captchaId === 'valid-captcha-id' && answer.toUpperCase() === 'K7P4X') {
        return { success: true };
      }
      return { success: false, error: 'Incorrect CAPTCHA. Please try again.' };
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getModelToken(User.name), useValue: mockUserModel },
        { provide: JwtService, useValue: mockJwtService },
        { provide: CaptchaService, useValue: mockCaptchaService },
        { provide: NotificationsService, useValue: mockNotificationsService },
        { provide: AuditService, useValue: mockAuditService },
        { provide: PhotoStorageService, useValue: mockPhotoStorageService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    captchaService = module.get<CaptchaService>(CaptchaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new farmer in PENDING state without issuing JWT', async () => {
      mockUserModel.findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      });
      mockUserModel.create.mockResolvedValue({
        _id: 'farmer-uuid-1',
        id: 'farmer-uuid-1',
        name: 'Ramesh Patel',
        phone: '9876543210',
        email: 'ramesh@farmer.in',
        role: Role.FARMER,
        verificationStatus: VerificationStatus.PENDING,
        approvalStatus: ApprovalStatus.PENDING,
        district: 'Nashik',
        state: 'Maharashtra',
        village: 'Pimpalgaon',
        location: 'Pimpalgaon Baswant',
        isVerified: false,
      });

      const result = await service.register({
        name: 'Ramesh Patel',
        phone: '9876543210',
        email: 'ramesh@farmer.in',
        password: 'Password@123',
        role: Role.FARMER,
        district: 'Nashik',
        state: 'Maharashtra',
        captchaId: 'valid-captcha-id',
        captchaAnswer: 'K7P4X',
      });

      expect(result.success).toBe(true);
      expect(result.approvalStatus).toBe(ApprovalStatus.PENDING);
      expect(result).not.toHaveProperty('accessToken');
      expect(mockNotificationsService.create).toHaveBeenCalled();
    });

    it('should reject self-registration as ADMIN', async () => {
      await expect(
        service.register({
          name: 'Fake Admin',
          phone: '9999999999',
          password: 'Password@123',
          role: Role.ADMIN,
          district: 'Delhi',
          state: 'Delhi',
          captchaId: 'valid-captcha-id',
          captchaAnswer: 'K7P4X',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject registration with weak password (missing special character)', async () => {
      await expect(
        service.register({
          name: 'Ramesh Patel',
          phone: '9876543210',
          password: 'WeakPassword123',
          role: Role.FARMER,
          district: 'Nashik',
          state: 'Maharashtra',
          captchaId: 'valid-captcha-id',
          captchaAnswer: 'K7P4X',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject registration with incorrect CAPTCHA', async () => {
      await expect(
        service.register({
          name: 'Ramesh Patel',
          phone: '9876543210',
          password: 'Password@123',
          role: Role.FARMER,
          district: 'Nashik',
          state: 'Maharashtra',
          captchaId: 'valid-captcha-id',
          captchaAnswer: 'WRONG_CAPTCHA',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('login approval status enforcement', () => {
    it('1. Approved user logs in successfully with valid CAPTCHA', async () => {
      const passwordHash = await bcrypt.hash('Farmer@123', 10);
      mockUserModel.findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue({
          _id: 'farmer-uuid-1',
          id: 'farmer-uuid-1',
          name: 'Ramesh Patel',
          phone: '9876543210',
          email: 'ramesh@farmer.in',
          passwordHash,
          role: Role.FARMER,
          approvalStatus: ApprovalStatus.APPROVED,
          verificationStatus: VerificationStatus.VERIFIED,
          district: 'Nashik',
          state: 'Maharashtra',
          location: 'Pimpalgaon',
          isVerified: true,
        }),
      });

      const result = await service.login({
        identifier: '9876543210',
        password: 'Farmer@123',
        captchaId: 'valid-captcha-id',
        captchaAnswer: 'K7P4X',
      });

      expect(result).toHaveProperty('accessToken', 'mock-jwt-token');
      expect(result.user.name).toEqual('Ramesh Patel');
      expect(result.user.role).toEqual(Role.FARMER);
      expect(mockJwtService.sign).toHaveBeenCalled();
    });

    it('2. Pending user is blocked from logging in with 403 Forbidden', async () => {
      const passwordHash = await bcrypt.hash('Farmer@123', 10);
      mockUserModel.findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue({
          _id: 'farmer-uuid-2',
          id: 'farmer-uuid-2',
          name: 'Pending Farmer',
          phone: '9876543210',
          passwordHash,
          role: Role.FARMER,
          approvalStatus: ApprovalStatus.PENDING,
          verificationStatus: VerificationStatus.PENDING,
        }),
      });

      await expect(
        service.login({
          identifier: '9876543210',
          password: 'Farmer@123',
          captchaId: 'valid-captcha-id',
          captchaAnswer: 'K7P4X',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('3. Rejected user is blocked from logging in with rejection reason', async () => {
      const passwordHash = await bcrypt.hash('Farmer@123', 10);
      mockUserModel.findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue({
          _id: 'farmer-uuid-3',
          id: 'farmer-uuid-3',
          name: 'Rejected Farmer',
          phone: '9876543210',
          passwordHash,
          role: Role.FARMER,
          approvalStatus: ApprovalStatus.REJECTED,
          verificationStatus: VerificationStatus.REJECTED,
          rejectionReason: 'Invalid land record verification.',
        }),
      });

      await expect(
        service.login({
          identifier: '9876543210',
          password: 'Farmer@123',
          captchaId: 'valid-captcha-id',
          captchaAnswer: 'K7P4X',
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
