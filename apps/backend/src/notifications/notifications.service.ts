import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationDocument } from '../database/schemas';
import { CreateNotificationDto } from './dto/create-notification.dto';

export const FALLBACK_NOTIFICATIONS: any[] = [
  {
    _id: 'notif-demo-1',
    id: 'notif-demo-1',
    recipientId: 'usr-farmer-1',
    type: 'BID_RECEIVED',
    title: 'New Bid Received',
    message: 'FreshCart Agro Ltd. placed an offer of ₹2,250/Qtl on your Tomato lot (60 Qtl).',
    entityType: 'LOT',
    entityId: 'lot-demo-1',
    isRead: false,
    createdAt: new Date(Date.now() - 3600000),
  },
  {
    _id: 'notif-demo-2',
    id: 'notif-demo-2',
    recipientId: 'usr-farmer-1',
    type: 'PAYMENT_PAID',
    title: 'Payment Settled',
    message: 'Payment of ₹1,74,000 for Potato Lot (120 Qtl) has been marked as PAID (Ref: UPI-SBI-882199).',
    entityType: 'TRANSACTION',
    entityId: 'txn-demo-1',
    isRead: true,
    createdAt: new Date(Date.now() - 86400000 * 2),
  },
];

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
  ) {}

  async create(dto: CreateNotificationDto) {
    const notifId = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    try {
      const created = await this.notificationModel.create({
        _id: notifId,
        recipientId: dto.recipientId,
        type: dto.type,
        title: dto.title,
        message: dto.message,
        entityType: dto.entityType || null,
        entityId: dto.entityId || null,
        isRead: false,
        createdAt: new Date(),
      });
      return { ...created.toObject(), id: created._id };
    } catch (err: any) {
      this.logger.warn(`MongoDB create notification fallback: ${err.message}`);
    }

    const newNotif = {
      _id: notifId,
      id: notifId,
      recipientId: dto.recipientId,
      type: dto.type,
      title: dto.title,
      message: dto.message,
      entityType: dto.entityType || null,
      entityId: dto.entityId || null,
      isRead: false,
      createdAt: new Date(),
    };
    FALLBACK_NOTIFICATIONS.unshift(newNotif);
    return newNotif;
  }

  async findAllForUser(userId: string, limit: number = 20) {
    try {
      const list = await this.notificationModel
        .find({ recipientId: userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();
      if (list && list.length > 0) {
        return list.map((n) => ({ ...n, id: n._id }));
      }
    } catch (err: any) {
      this.logger.warn(`MongoDB findAll notifications fallback: ${err.message}`);
    }

    return FALLBACK_NOTIFICATIONS.filter((n) => n.recipientId === userId)
      .slice(0, limit)
      .map((n) => ({ ...n, id: n._id || n.id }))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getUnreadCount(userId: string): Promise<number> {
    try {
      const count = await this.notificationModel.countDocuments({
        recipientId: userId,
        isRead: false,
      });
      return count;
    } catch (err: any) {
      this.logger.warn(`MongoDB getUnreadCount fallback: ${err.message}`);
    }

    return FALLBACK_NOTIFICATIONS.filter((n) => n.recipientId === userId && !n.isRead).length;
  }

  async markAsRead(notificationId: string, userId: string) {
    try {
      await this.notificationModel.updateOne(
        { _id: notificationId, recipientId: userId },
        { $set: { isRead: true } },
      );
    } catch (err: any) {
      this.logger.warn(`MongoDB markAsRead fallback: ${err.message}`);
    }

    const notif = FALLBACK_NOTIFICATIONS.find(
      (n) => (n.id === notificationId || n._id === notificationId) && n.recipientId === userId,
    );
    if (notif) notif.isRead = true;
    return { success: true };
  }

  async markAllAsRead(userId: string) {
    try {
      const res = await this.notificationModel.updateMany(
        { recipientId: userId, isRead: false },
        { $set: { isRead: true } },
      );
      return { success: true, count: res.modifiedCount };
    } catch (err: any) {
      this.logger.warn(`MongoDB markAllAsRead fallback: ${err.message}`);
    }

    FALLBACK_NOTIFICATIONS.forEach((n) => {
      if (n.recipientId === userId) n.isRead = true;
    });
    return { success: true, count: FALLBACK_NOTIFICATIONS.length };
  }
}
