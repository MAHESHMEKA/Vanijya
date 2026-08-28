import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { CaptchaService } from './captcha.service';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let captchaService: CaptchaService;

  const mockPrismaService = {
    isConnected: true,
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock-jwt-token'),
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
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: CaptchaService, useValue: mockCaptchaService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
    captchaService = module.get<CaptchaService>(CaptchaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new farmer and return an access token', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({
        id: 'farmer-uuid-1',
        name: 'Ramesh Patel',
        phone: '9876543210',
        email: 'ramesh@farmer.in',
        role: Role.FARMER,
        district: 'Nashik',
        state: 'Maharashtra',
        location: 'Pimpalgaon',
        isVerified: true,
      });

      const result = await service.register({
        name: 'Ramesh Patel',
        phone: '9876543210',
        email: 'ramesh@farmer.in',
        password: 'Password@123',
        role: Role.FARMER,
        district: 'Nashik',
        state: 'Maharashtra',
      });

      expect(result).toHaveProperty('accessToken', 'mock-jwt-token');
      expect(result.user.name).toEqual('Ramesh Patel');
      expect(result.user.role).toEqual(Role.FARMER);
    });
  });

  describe('login with Visual Alphanumeric CAPTCHA verification', () => {
    it('1. Login with valid CAPTCHA answer succeeds and returns JWT', async () => {
      const passwordHash = await bcrypt.hash('Farmer@123', 10);
      mockPrismaService.user.findFirst.mockResolvedValue({
        id: 'farmer-uuid-1',
        name: 'Ramesh Patel',
        phone: '9876543210',
        email: 'ramesh@farmer.in',
        passwordHash,
        role: Role.FARMER,
        district: 'Nashik',
        state: 'Maharashtra',
        location: 'Pimpalgaon',
        isVerified: true,
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

    it('2. Login without CAPTCHA challenge ID or answer fails with 401', async () => {
      await expect(
        service.login({
          identifier: '9876543210',
          password: 'Farmer@123',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('3. Login with incorrect CAPTCHA answer fails with 401', async () => {
      await expect(
        service.login({
          identifier: '9876543210',
          password: 'Farmer@123',
          captchaId: 'valid-captcha-id',
          captchaAnswer: 'WRONG123',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('4. CAPTCHA verification failure prevents JWT creation', async () => {
      mockJwtService.sign.mockClear();
      try {
        await service.login({
          identifier: '9876543210',
          password: 'Farmer@123',
          captchaId: 'valid-captcha-id',
          captchaAnswer: 'WRONG123',
        });
      } catch {
        // Expected
      }
      expect(mockJwtService.sign).not.toHaveBeenCalled();
    });

    it('5. Correct CAPTCHA + invalid password still fails normally with 401', async () => {
      const passwordHash = await bcrypt.hash('Farmer@123', 10);
      mockPrismaService.user.findFirst.mockResolvedValue({
        id: 'farmer-uuid-1',
        name: 'Ramesh Patel',
        phone: '9876543210',
        email: 'ramesh@farmer.in',
        passwordHash,
        role: Role.FARMER,
      });

      await expect(
        service.login({
          identifier: '9876543210',
          password: 'WrongPassword999',
          captchaId: 'valid-captcha-id',
          captchaAnswer: 'K7P4X',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('6. Existing RBAC roles (FARMER, BUYER, ADMIN) remain unchanged in JWT payload', async () => {
      const passwordHash = await bcrypt.hash('Admin@123', 10);
      mockPrismaService.user.findFirst.mockResolvedValue({
        id: 'admin-uuid-1',
        name: 'Vanijya System Admin',
        phone: '9876543214',
        email: 'admin@vanijya.gov.in',
        passwordHash,
        role: Role.ADMIN,
        isVerified: true,
      });

      const result = await service.login({
        identifier: 'admin@vanijya.gov.in',
        password: 'Admin@123',
        captchaId: 'valid-captcha-id',
        captchaAnswer: 'K7P4X',
      });

      expect(result.user.role).toEqual(Role.ADMIN);
    });
  });
});
