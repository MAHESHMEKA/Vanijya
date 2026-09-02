import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotificationsService } from './notifications.service';
import { Notification, NotificationType } from '../database/schemas';

describe('NotificationsService', () => {
  let service: NotificationsService;

  const mockNotificationModel = {
    create: jest.fn(),
    find: jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([]),
        }),
      }),
    }),
    countDocuments: jest.fn(),
    updateOne: jest.fn(),
    updateMany: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: getModelToken(Notification.name), useValue: mockNotificationModel },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create notification in MongoDB when connected', async () => {
    mockNotificationModel.create.mockResolvedValue({
      toObject: () => ({
        _id: 'notif-101',
        recipientId: 'usr-farmer-1',
        type: NotificationType.BID_RECEIVED,
        title: 'New Bid Received',
        message: 'New bid placed',
        isRead: false,
      }),
      _id: 'notif-101',
    });

    const result = await service.create({
      recipientId: 'usr-farmer-1',
      type: NotificationType.BID_RECEIVED,
      title: 'New Bid Received',
      message: 'New bid placed',
    });

    expect(result.id).toBe('notif-101');
    expect(mockNotificationModel.create).toHaveBeenCalled();
  });

  it('should return unread count for user', async () => {
    mockNotificationModel.countDocuments.mockResolvedValue(3);
    const count = await service.getUnreadCount('usr-farmer-1');
    expect(count).toBe(3);
  });

  it('should mark all notifications as read', async () => {
    mockNotificationModel.updateMany.mockResolvedValue({ modifiedCount: 4 });
    const result = await service.markAllAsRead('usr-farmer-1');
    expect(result.count).toBe(4);
  });
});
