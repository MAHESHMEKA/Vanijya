import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock-jwt-token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
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

  describe('login', () => {
    it('should login with valid phone and password', async () => {
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
      });

      expect(result).toHaveProperty('accessToken', 'mock-jwt-token');
      expect(result.user.name).toEqual('Ramesh Patel');
    });
  });
});
