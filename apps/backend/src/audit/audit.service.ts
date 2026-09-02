import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLog, AuditLogDocument, User, UserDocument, AuditAction } from '../database/schemas';
import { FALLBACK_USERS } from '../users/users.service';

export interface AuditEntry {
  id?: string;
  bidId?: string;
  lotId?: string;
  actorId: string;
  action: AuditAction;
  oldQuantity?: number;
  newQuantity?: number;
  oldStatus?: string;
  newStatus?: string;
  price?: number;
  metadata?: any;
  createdAt?: Date;
}

export const FALLBACK_AUDIT_LOGS: any[] = [
  {
    _id: 'audit-demo-1',
    id: 'audit-demo-1',
    actorId: 'usr-farmer-1',
    actorName: 'Ramesh Patel',
    actorRole: 'FARMER',
    action: AuditAction.LOT_CREATED,
    lotId: 'lot-demo-1',
    price: 2200,
    newQuantity: 100,
    createdAt: new Date(Date.now() - 3600000 * 4),
    metadata: { cropName: 'Tomato', location: 'Nashik' },
  },
  {
    _id: 'audit-demo-2',
    id: 'audit-demo-2',
    actorId: 'usr-buyer-1',
    actorName: 'FreshCart Agro Ltd.',
    actorRole: 'BUYER',
    action: AuditAction.BID_PLACED,
    lotId: 'lot-demo-1',
    bidId: 'bid-demo-1',
    price: 2250,
    newQuantity: 100,
    createdAt: new Date(Date.now() - 3600000 * 2),
    metadata: { cropName: 'Tomato', message: 'Direct warehouse pickup' },
  },
];

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectModel(AuditLog.name) private readonly auditLogModel: Model<AuditLogDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async log(entry: AuditEntry) {
    const actor = FALLBACK_USERS.find((u) => u.id === entry.actorId || u._id === entry.actorId);
    const logItem = {
      _id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      ...entry,
      actorName: actor?.name || 'System User',
      actorRole: actor?.role || 'FARMER',
      createdAt: entry.createdAt || new Date(),
    };

    FALLBACK_AUDIT_LOGS.unshift(logItem);

    try {
      await this.auditLogModel.create({
        _id: logItem._id,
        actorId: entry.actorId,
        action: entry.action,
        bidId: entry.bidId || null,
        lotId: entry.lotId || null,
        oldQuantity: entry.oldQuantity || null,
        newQuantity: entry.newQuantity || null,
        oldStatus: entry.oldStatus || null,
        newStatus: entry.newStatus || null,
        price: entry.price || null,
        metadata: entry.metadata || null,
        createdAt: logItem.createdAt,
      });
    } catch (err: any) {
      this.logger.warn(`MongoDB log audit fallback: ${err.message}`);
    }

    return logItem;
  }

  async getRecent(limit: number = 50) {
    try {
      const logs = await this.auditLogModel
        .find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

      if (logs && logs.length > 0) {
        const users = await this.userModel.find().lean();
        const userMap = new Map(users.map((u) => [u._id, u]));

        return logs.map((l) => {
          const actor = userMap.get(l.actorId);
          return {
            ...l,
            id: l._id,
            actorName: actor?.name || 'User',
            actorRole: actor?.role || 'FARMER',
          };
        });
      }
    } catch (err: any) {
      this.logger.warn(`MongoDB getRecent audit fallback: ${err.message}`);
    }

    return FALLBACK_AUDIT_LOGS.slice(0, limit).map((l) => ({ ...l, id: l._id || l.id }));
  }
}
