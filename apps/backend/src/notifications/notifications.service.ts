import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationType } from '@prisma/client';

export const FALLBACK_NOTIFICATIONS: any[] = [
  {
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
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateNotificationDto) {
    if (!this.prisma.isConnected) {
      const newNotif = {
        id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
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

    try {
      return await this.prisma.notification.create({
        data: {
          recipientId: dto.recipientId,
          type: dto.type,
          title: dto.title,
          message: dto.message,
          entityType: dto.entityType,
          entityId: dto.entityId,
          isRead: false,
        },
      });
    } catch (err) {
      const newNotif = {
        id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
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
  }

  async findAllForUser(userId: string, limit: number = 20) {
    if (!this.prisma.isConnected) {
      return FALLBACK_NOTIFICATIONS.filter((n) => n.recipientId === userId)
        .slice(0, limit)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    try {
      return await this.prisma.notification.findMany({
        where: { recipientId: userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });
    } catch (err) {
      return FALLBACK_NOTIFICATIONS.filter((n) => n.recipientId === userId)
        .slice(0, limit)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  }

  async getUnreadCount(userId: string): Promise<number> {
    if (!this.prisma.isConnected) {
      return FALLBACK_NOTIFICATIONS.filter((n) => n.recipientId === userId && !n.isRead).length;
    }

    try {
      return await this.prisma.notification.count({
        where: {
          recipientId: userId,
          isRead: false,
        },
      });
    } catch (err) {
      return FALLBACK_NOTIFICATIONS.filter((n) => n.recipientId === userId && !n.isRead).length;
    }
  }

  async markAsRead(notificationId: string, userId: string) {
    if (!this.prisma.isConnected) {
      const notif = FALLBACK_NOTIFICATIONS.find(
        (n) => n.id === notificationId && n.recipientId === userId,
      );
      if (notif) notif.isRead = true;
      return notif || { success: true };
    }

    try {
      return await this.prisma.notification.updateMany({
        where: {
          id: notificationId,
          recipientId: userId,
        },
        data: { isRead: true },
      });
    } catch (err) {
      const notif = FALLBACK_NOTIFICATIONS.find(
        (n) => n.id === notificationId && n.recipientId === userId,
      );
      if (notif) notif.isRead = true;
      return notif || { success: true };
    }
  }

  async markAllAsRead(userId: string) {
    if (!this.prisma.isConnected) {
      FALLBACK_NOTIFICATIONS.forEach((n) => {
        if (n.recipientId === userId) n.isRead = true;
      });
      return { success: true, count: FALLBACK_NOTIFICATIONS.length };
    }

    try {
      const result = await this.prisma.notification.updateMany({
        where: { recipientId: userId, isRead: false },
        data: { isRead: true },
      });
      return { success: true, count: result.count };
    } catch (err) {
      FALLBACK_NOTIFICATIONS.forEach((n) => {
        if (n.recipientId === userId) n.isRead = true;
      });
      return { success: true, count: 0 };
    }
  }
}
