import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from '@prisma/client';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    isConnected: true,
    notification: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      updateMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create notification in Prisma when connected', async () => {
    mockPrismaService.notification.create.mockResolvedValue({
      id: 'notif-101',
      recipientId: 'usr-farmer-1',
      type: NotificationType.BID_RECEIVED,
      title: 'New Bid Received',
      message: 'New bid placed',
      isRead: false,
    });

    const result = await service.create({
      recipientId: 'usr-farmer-1',
      type: NotificationType.BID_RECEIVED,
      title: 'New Bid Received',
      message: 'New bid placed',
    });

    expect(result.id).toBe('notif-101');
    expect(mockPrismaService.notification.create).toHaveBeenCalled();
  });

  it('should return unread count for user', async () => {
    mockPrismaService.notification.count.mockResolvedValue(3);
    const count = await service.getUnreadCount('usr-farmer-1');
    expect(count).toBe(3);
  });

  it('should mark all notifications as read', async () => {
    mockPrismaService.notification.updateMany.mockResolvedValue({ count: 4 });
    const result = await service.markAllAsRead('usr-farmer-1');
    expect(result.count).toBe(4);
  });
});
