import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AuthService } from '../auth/auth.service';
import { Role, ApprovalStatus, VerificationStatus, AuditAction, NotificationType } from '@prisma/client';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('AdminService (Registration Verification Workflow)', () => {
  let service: AdminService;
  let prisma: PrismaService;
  let auditService: AuditService;
  let notificationsService: NotificationsService;

  const mockPrismaService = {
    isConnected: true,
    user: {
      count: jest.fn().mockResolvedValue(2),
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    cropLot: { count: jest.fn().mockResolvedValue(0), findMany: jest.fn().mockResolvedValue([]) },
    bid: { count: jest.fn().mockResolvedValue(0), findMany: jest.fn().mockResolvedValue([]) },
    transaction: { findMany: jest.fn().mockResolvedValue([]) },
    payment: { findMany: jest.fn().mockResolvedValue([]) },
    auditLog: { count: jest.fn().mockResolvedValue(0) },
  };

  const mockAuditService = {
    log: jest.fn().mockResolvedValue({ id: 'audit-1' }),
    getRecent: jest.fn().mockResolvedValue([]),
  };

  const mockNotificationsService = {
    create: jest.fn().mockResolvedValue({ id: 'notif-1' }),
  };

  const mockAuthService = {
    getInMemoryRegisteredUsers: jest.fn().mockReturnValue([]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: AuditService, useValue: mockAuditService },
        { provide: NotificationsService, useValue: mockNotificationsService },
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    prisma = module.get<PrismaService>(PrismaService);
    auditService = module.get<AuditService>(AuditService);
    notificationsService = module.get<NotificationsService>(NotificationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('approveUser', () => {
    it('should approve a pending user, update verificationStatus to VERIFIED, log audit, and notify user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'usr-farmer-new',
        name: 'New Farmer',
        role: Role.FARMER,
        approvalStatus: ApprovalStatus.PENDING,
      });

      mockPrismaService.user.update.mockResolvedValue({
        id: 'usr-farmer-new',
        name: 'New Farmer',
        role: Role.FARMER,
        approvalStatus: ApprovalStatus.APPROVED,
        verificationStatus: VerificationStatus.VERIFIED,
        isVerified: true,
      });

      const result = await service.approveUser('usr-farmer-new', 'admin-id-1');

      expect(result.success).toBe(true);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'usr-farmer-new' },
        data: expect.objectContaining({
          approvalStatus: ApprovalStatus.APPROVED,
          verificationStatus: VerificationStatus.VERIFIED,
          isVerified: true,
          approvedBy: 'admin-id-1',
        }),
      });
      expect(mockAuditService.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: AuditAction.USER_APPROVED }),
      );
      expect(mockNotificationsService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          recipientId: 'usr-farmer-new',
          type: NotificationType.SYSTEM,
        }),
      );
    });

    it('should throw NotFoundException if applicant does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.approveUser('non-existent-id', 'admin-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('rejectUser', () => {
    it('should reject applicant with reason, update status to REJECTED, log audit, and notify user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'usr-buyer-new',
        name: 'Bad Buyer',
        role: Role.BUYER,
        approvalStatus: ApprovalStatus.PENDING,
      });

      mockPrismaService.user.update.mockResolvedValue({
        id: 'usr-buyer-new',
        name: 'Bad Buyer',
        role: Role.BUYER,
        approvalStatus: ApprovalStatus.REJECTED,
        verificationStatus: VerificationStatus.REJECTED,
        isVerified: false,
        rejectionReason: 'Invalid APMC license and duplicate mobile number.',
      });

      const result = await service.rejectUser(
        'usr-buyer-new',
        'admin-id-1',
        'Invalid APMC license and duplicate mobile number.',
      );

      expect(result.success).toBe(true);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'usr-buyer-new' },
        data: expect.objectContaining({
          approvalStatus: ApprovalStatus.REJECTED,
          verificationStatus: VerificationStatus.REJECTED,
          isVerified: false,
          rejectionReason: 'Invalid APMC license and duplicate mobile number.',
        }),
      });
      expect(mockAuditService.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: AuditAction.USER_REJECTED }),
      );
      expect(mockNotificationsService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          recipientId: 'usr-buyer-new',
          type: NotificationType.SYSTEM,
          message: expect.stringContaining('Invalid APMC license and duplicate mobile number.'),
        }),
      );
    });

    it('should reject rejection attempt without reason', async () => {
      await expect(service.rejectUser('usr-buyer-new', 'admin-id-1', '')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
