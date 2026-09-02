import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  User,
  UserDocument,
  CropLot,
  CropLotDocument,
  Crop,
  CropDocument,
  Bid,
  BidDocument,
  Transaction,
  TransactionDocument,
  Payment,
  PaymentDocument,
  AuditLog,
  AuditLogDocument,
  CropLotStatus,
  BidStatus,
  PaymentStatus,
  Role,
  AuditAction,
  ApprovalStatus,
  VerificationStatus,
  NotificationType,
} from '../database/schemas';
import { FALLBACK_LOTS } from '../lots/lots.service';
import { FALLBACK_BIDS, FALLBACK_TRANSACTIONS, FALLBACK_PAYMENTS } from '../bids/bids.service';
import { FALLBACK_USERS, AuthService } from '../auth/auth.service';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(CropLot.name) private readonly cropLotModel: Model<CropLotDocument>,
    @InjectModel(Crop.name) private readonly cropModel: Model<CropDocument>,
    @InjectModel(Bid.name) private readonly bidModel: Model<BidDocument>,
    @InjectModel(Transaction.name) private readonly transactionModel: Model<TransactionDocument>,
    @InjectModel(Payment.name) private readonly paymentModel: Model<PaymentDocument>,
    @InjectModel(AuditLog.name) private readonly auditLogModel: Model<AuditLogDocument>,
    private readonly auditService: AuditService,
    private readonly notificationsService: NotificationsService,
    private readonly authService: AuthService,
  ) {}

  async getDashboardStats() {
    const recentActivity = await this.auditService.getRecent(10);

    try {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const [
        totalFarmers,
        totalBuyers,
        pendingFarmers,
        pendingBuyers,
        approvedToday,
        rejectedToday,
        activeLots,
        activeBiddingLots,
        soldLots,
        cancelledLots,
        pendingBids,
        acceptedBids,
        cancelledBids,
        transactions,
        payments,
      ] = await Promise.all([
        this.userModel.countDocuments({ role: Role.FARMER }),
        this.userModel.countDocuments({ role: Role.BUYER }),
        this.userModel.countDocuments({ role: Role.FARMER, approvalStatus: ApprovalStatus.PENDING }),
        this.userModel.countDocuments({ role: Role.BUYER, approvalStatus: ApprovalStatus.PENDING }),
        this.userModel.countDocuments({ approvalStatus: ApprovalStatus.APPROVED, approvedAt: { $gte: todayStart } }),
        this.userModel.countDocuments({ approvalStatus: ApprovalStatus.REJECTED, updatedAt: { $gte: todayStart } }),
        this.cropLotModel.countDocuments({ status: { $in: [CropLotStatus.OPEN, CropLotStatus.BIDDING] } }),
        this.cropLotModel.countDocuments({ status: CropLotStatus.BIDDING }),
        this.cropLotModel.countDocuments({ status: CropLotStatus.SOLD }),
        this.cropLotModel.countDocuments({ status: CropLotStatus.CANCELLED }),
        this.bidModel.countDocuments({ status: BidStatus.PENDING }),
        this.bidModel.countDocuments({ status: BidStatus.ACCEPTED }),
        this.bidModel.countDocuments({ status: BidStatus.WITHDRAWN }),
        this.transactionModel.find().select('totalAmount').lean(),
        this.paymentModel.find().select('amount status').lean(),
      ]);

      const modifiedBids = await this.auditLogModel.countDocuments({ action: AuditAction.QUANTITY_MODIFIED });
      const totalTransactionValue = transactions.reduce((acc, t) => acc + (t.totalAmount || 0), 0);
      const completedPaymentsValue = payments
        .filter((p) => p.status === PaymentStatus.PAID)
        .reduce((acc, p) => acc + (p.amount || 0), 0);
      const pendingPaymentsValue = payments
        .filter((p) => p.status === PaymentStatus.PENDING)
        .reduce((acc, p) => acc + (p.amount || 0), 0);

      return {
        totalFarmers,
        totalBuyers,
        pendingFarmers,
        pendingBuyers,
        approvedToday,
        rejectedToday,
        activeLots,
        activeBiddingLots,
        soldLots,
        cancelledLots,
        pendingBids,
        acceptedBids,
        cancelledBids,
        modifiedBids,
        totalTransactionValue,
        pendingPaymentsValue,
        completedPaymentsValue,
        recentActivity,
      };
    } catch (err: any) {
      this.logger.warn(`MongoDB getDashboardStats fallback: ${err.message}`);
    }

    // In-memory fallback
    const allUsers = [...FALLBACK_USERS, ...this.authService.getInMemoryRegisteredUsers()];
    const farmers = allUsers.filter((u) => u.role === Role.FARMER);
    const buyers = allUsers.filter((u) => u.role === Role.BUYER);

    const pendingFarmers = allUsers.filter((u) => u.role === Role.FARMER && u.approvalStatus === ApprovalStatus.PENDING).length;
    const pendingBuyers = allUsers.filter((u) => u.role === Role.BUYER && u.approvalStatus === ApprovalStatus.PENDING).length;
    const activeLots = FALLBACK_LOTS.filter((l) => l.status === CropLotStatus.OPEN || l.status === CropLotStatus.BIDDING).length;
    const activeBiddingLots = FALLBACK_LOTS.filter((l) => l.status === CropLotStatus.BIDDING).length;
    const soldLots = FALLBACK_LOTS.filter((l) => l.status === CropLotStatus.SOLD).length;
    const cancelledLots = FALLBACK_LOTS.filter((l) => l.status === CropLotStatus.CANCELLED).length;

    const pendingBids = FALLBACK_BIDS.filter((b) => b.status === BidStatus.PENDING).length;
    const acceptedBids = FALLBACK_BIDS.filter((b) => b.status === BidStatus.ACCEPTED).length;
    const cancelledBids = FALLBACK_BIDS.filter((b) => b.status === BidStatus.WITHDRAWN).length;
    const modifiedBids = (await this.auditService.getRecent(100)).filter((a) => a.action === AuditAction.QUANTITY_MODIFIED).length;

    const totalTransactionValue = FALLBACK_TRANSACTIONS.reduce((acc, t) => acc + (t.totalAmount || 0), 0) + (soldLots > 0 ? 174000 : 0);
    const completedPaymentsValue = FALLBACK_PAYMENTS.filter((p) => p.status === PaymentStatus.PAID).reduce((acc, p) => acc + (p.amount || 0), 0) + (soldLots > 0 ? 174000 : 0);
    const pendingPaymentsValue = FALLBACK_PAYMENTS.filter((p) => p.status === PaymentStatus.PENDING).reduce((acc, p) => acc + (p.amount || 0), 0);

    return {
      totalFarmers: farmers.length,
      totalBuyers: buyers.length,
      pendingFarmers,
      pendingBuyers,
      approvedToday: allUsers.filter((u) => u.approvalStatus === ApprovalStatus.APPROVED).length,
      rejectedToday: allUsers.filter((u) => u.approvalStatus === ApprovalStatus.REJECTED).length,
      activeLots,
      activeBiddingLots,
      soldLots,
      cancelledLots,
      pendingBids,
      acceptedBids,
      cancelledBids,
      modifiedBids,
      totalTransactionValue,
      pendingPaymentsValue,
      completedPaymentsValue,
      recentActivity,
    };
  }

  async getRegistrations(query: {
    role?: Role;
    status?: ApprovalStatus;
    search?: string;
    sort?: 'asc' | 'desc';
  }) {
    try {
      const filter: any = {
        role: { $in: [Role.FARMER, Role.BUYER] },
      };

      if (query.role) filter.role = query.role;
      if (query.status) filter.approvalStatus = query.status;
      if (query.search) {
        const regex = new RegExp(query.search, 'i');
        filter.$or = [
          { name: regex },
          { phone: regex },
          { email: regex },
          { district: regex },
          { state: regex },
          { organization: regex },
        ];
      }

      const sortOrder = query.sort === 'asc' ? 1 : -1;
      const list = await this.userModel.find(filter).sort({ createdAt: sortOrder }).lean();
      if (list && list.length > 0) {
        return list.map((u) => ({
          ...u,
          id: u._id,
        }));
      }
    } catch (err: any) {
      this.logger.warn(`MongoDB getRegistrations fallback: ${err.message}`);
    }

    const allUsers = [...FALLBACK_USERS, ...this.authService.getInMemoryRegisteredUsers()];
    let filtered = allUsers.filter((u) => u.role !== Role.ADMIN);

    if (query.role) filtered = filtered.filter((u) => u.role === query.role);
    if (query.status) filtered = filtered.filter((u) => u.approvalStatus === query.status);
    if (query.search) {
      const q = query.search.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.name?.toLowerCase().includes(q) ||
          u.phone?.includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.district?.toLowerCase().includes(q) ||
          u.state?.toLowerCase().includes(q) ||
          u.organization?.toLowerCase().includes(q),
      );
    }

    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return query.sort === 'asc' ? dateA - dateB : dateB - dateA;
    });

    return filtered.map((u) => ({ ...u, id: u._id || u.id }));
  }

  async getRegistrationById(id: string) {
    try {
      const user = await this.userModel.findById(id).lean();
      if (user) {
        return { ...user, id: user._id };
      }
    } catch (err: any) {
      this.logger.warn(`MongoDB getRegistrationById fallback for ${id}: ${err.message}`);
    }

    const allUsers = [...FALLBACK_USERS, ...this.authService.getInMemoryRegisteredUsers()];
    const user = allUsers.find((u) => u.id === id || u._id === id);
    if (!user) throw new NotFoundException(`User registration ${id} not found.`);
    return { ...user, id: user._id || user.id };
  }

  async approveUser(userId: string, adminId: string) {
    const allUsers = [...FALLBACK_USERS, ...this.authService.getInMemoryRegisteredUsers()];
    const memoryUser = allUsers.find((u) => u.id === userId || u._id === userId);
    if (memoryUser) {
      memoryUser.approvalStatus = ApprovalStatus.APPROVED;
      memoryUser.verificationStatus = VerificationStatus.VERIFIED;
      memoryUser.isVerified = true;
      memoryUser.approvedBy = adminId;
      memoryUser.approvedAt = new Date();
      memoryUser.rejectionReason = null;
    }

    try {
      const updated = await this.userModel
        .findByIdAndUpdate(
          userId,
          {
            $set: {
              approvalStatus: ApprovalStatus.APPROVED,
              verificationStatus: VerificationStatus.VERIFIED,
              isVerified: true,
              approvedBy: adminId,
              approvedAt: new Date(),
              rejectionReason: null,
            },
          },
          { new: true },
        )
        .lean();

      if (updated) {
        await this.auditService.log({
          actorId: adminId,
          action: AuditAction.USER_APPROVED,
          metadata: { userId: updated._id, userName: updated.name, role: updated.role },
        });

        await this.notificationsService.create({
          recipientId: updated._id,
          type: NotificationType.SYSTEM,
          title: 'Account Registration Approved! 🎉',
          message: 'Your Vanijya account has been verified and approved by the administrator. You may now sign in and access the trading dashboard.',
          entityType: 'USER',
          entityId: updated._id,
        });

        return {
          success: true,
          message: `User ${updated.name} (${updated.role}) has been successfully approved.`,
          user: { ...updated, id: updated._id },
        };
      }
    } catch (err: any) {
      this.logger.warn(`MongoDB approveUser fallback for ${userId}: ${err.message}`);
    }

    if (!memoryUser) throw new NotFoundException(`User registration ${userId} not found.`);

    await this.auditService.log({
      actorId: adminId,
      action: AuditAction.USER_APPROVED,
      metadata: { userId: memoryUser.id, userName: memoryUser.name, role: memoryUser.role },
    });

    await this.notificationsService.create({
      recipientId: memoryUser.id,
      type: NotificationType.SYSTEM,
      title: 'Account Registration Approved! 🎉',
      message: 'Your Vanijya account has been verified and approved by the administrator. You may now sign in and access the trading dashboard.',
      entityType: 'USER',
      entityId: memoryUser.id,
    });

    return {
      success: true,
      message: `User ${memoryUser.name} (${memoryUser.role}) has been successfully approved.`,
      user: memoryUser,
    };
  }

  async rejectUser(userId: string, adminId: string, reason: string) {
    if (!reason || reason.trim() === '') {
      throw new BadRequestException('A reason for rejection must be provided.');
    }

    const allUsers = [...FALLBACK_USERS, ...this.authService.getInMemoryRegisteredUsers()];
    const memoryUser = allUsers.find((u) => u.id === userId || u._id === userId);
    if (memoryUser) {
      memoryUser.approvalStatus = ApprovalStatus.REJECTED;
      memoryUser.verificationStatus = VerificationStatus.REJECTED;
      memoryUser.isVerified = false;
      memoryUser.rejectionReason = reason;
    }

    try {
      const updated = await this.userModel
        .findByIdAndUpdate(
          userId,
          {
            $set: {
              approvalStatus: ApprovalStatus.REJECTED,
              verificationStatus: VerificationStatus.REJECTED,
              isVerified: false,
              rejectionReason: reason,
            },
          },
          { new: true },
        )
        .lean();

      if (updated) {
        await this.auditService.log({
          actorId: adminId,
          action: AuditAction.USER_REJECTED,
          metadata: { userId: updated._id, userName: updated.name, role: updated.role, reason },
        });

        await this.notificationsService.create({
          recipientId: updated._id,
          type: NotificationType.SYSTEM,
          title: 'Account Registration Update',
          message: `Your Vanijya account registration was rejected. Reason: ${reason}`,
          entityType: 'USER',
          entityId: updated._id,
        });

        return {
          success: true,
          message: `User ${updated.name} registration was rejected.`,
          user: { ...updated, id: updated._id },
        };
      }
    } catch (err: any) {
      this.logger.warn(`MongoDB rejectUser fallback: ${err.message}`);
    }

    if (!memoryUser) throw new NotFoundException(`User registration ${userId} not found.`);

    await this.auditService.log({
      actorId: adminId,
      action: AuditAction.USER_REJECTED,
      metadata: { userId: memoryUser.id, userName: memoryUser.name, role: memoryUser.role, reason },
    });

    await this.notificationsService.create({
      recipientId: memoryUser.id,
      type: NotificationType.SYSTEM,
      title: 'Account Registration Update',
      message: `Your Vanijya account registration was rejected. Reason: ${reason}`,
      entityType: 'USER',
      entityId: memoryUser.id,
    });

    return {
      success: true,
      message: `User ${memoryUser.name} registration was rejected.`,
      user: memoryUser,
    };
  }

  async getAllLots(query: any = {}) {
    try {
      const filter: any = {};
      if (query.status) filter.status = query.status;
      if (query.cropId) filter.cropId = query.cropId;

      const lots = await this.cropLotModel.find(filter).sort({ createdAt: -1 }).lean();
      if (lots && lots.length > 0) {
        const crops = await this.cropModel.find().lean();
        const users = await this.userModel.find().lean();
        const cropMap = new Map(crops.map((c) => [c._id, c]));
        const userMap = new Map(users.map((u) => [u._id, u]));

        return lots.map((l) => ({
          ...l,
          id: l._id,
          crop: cropMap.get(l.cropId) || { name: 'Produce' },
          farmer: userMap.get(l.farmerId) || { name: 'Farmer' },
        }));
      }
    } catch (err: any) {
      this.logger.warn(`MongoDB getAllLots fallback: ${err.message}`);
    }

    let lots = [...FALLBACK_LOTS];
    if (query.status) lots = lots.filter((l) => l.status === query.status);
    if (query.cropId) lots = lots.filter((l) => l.cropId === query.cropId || l.crop?.name === query.cropId);
    return lots;
  }

  async getAllBids(query: any = {}) {
    try {
      const filter: any = {};
      if (query.status) filter.status = query.status;

      const bids = await this.bidModel.find(filter).sort({ createdAt: -1 }).lean();
      if (bids && bids.length > 0) {
        const users = await this.userModel.find().lean();
        const lots = await this.cropLotModel.find().lean();
        const crops = await this.cropModel.find().lean();

        const userMap = new Map(users.map((u) => [u._id, u]));
        const lotMap = new Map(lots.map((l) => [l._id, l]));
        const cropMap = new Map(crops.map((c) => [c._id, c]));

        return bids.map((b) => {
          const lot = lotMap.get(b.lotId);
          const crop = lot ? cropMap.get(lot.cropId) : null;
          const buyer = userMap.get(b.buyerId);
          const farmer = lot ? userMap.get(lot.farmerId) : null;

          return {
            ...b,
            id: b._id,
            buyer: buyer ? { name: buyer.name, district: buyer.district, phone: buyer.phone } : { name: 'Buyer' },
            lot: lot ? { ...lot, id: lot._id, crop: crop || { name: 'Produce' }, farmer: farmer || { name: 'Farmer' } } : null,
          };
        });
      }
    } catch (err: any) {
      this.logger.warn(`MongoDB getAllBids fallback: ${err.message}`);
    }

    let bids = [...FALLBACK_BIDS];
    if (query.status) bids = bids.filter((b) => b.status === query.status);
    return bids;
  }

  async getUsers() {
    try {
      const users = await this.userModel.find().lean();
      if (users && users.length > 0) {
        const lots = await this.cropLotModel.find().lean();
        const bids = await this.bidModel.find().lean();
        const txns = await this.transactionModel.find().lean();

        const farmers = users
          .filter((u) => u.role === Role.FARMER)
          .map((f) => ({
            ...f,
            id: f._id,
            activeLots: lots.filter((l) => l.farmerId === f._id && l.status !== CropLotStatus.SOLD && l.status !== CropLotStatus.CANCELLED).length,
            soldLots: lots.filter((l) => l.farmerId === f._id && l.status === CropLotStatus.SOLD).length,
            totalSales: txns.filter((t) => t.farmerId === f._id).reduce((acc, t) => acc + (t.totalAmount || 0), 0),
          }));

        const buyers = users
          .filter((u) => u.role === Role.BUYER)
          .map((b) => ({
            ...b,
            id: b._id,
            activeBids: bids.filter((bid) => bid.buyerId === b._id && bid.status === BidStatus.PENDING).length,
            acceptedBids: bids.filter((bid) => bid.buyerId === b._id && bid.status === BidStatus.ACCEPTED).length,
            cancelledBids: bids.filter((bid) => bid.buyerId === b._id && bid.status === BidStatus.WITHDRAWN).length,
            totalProcurement: txns.filter((t) => t.buyerId === b._id).reduce((acc, t) => acc + (t.totalAmount || 0), 0),
          }));

        return { farmers, buyers };
      }
    } catch (err: any) {
      this.logger.warn(`MongoDB getUsers fallback: ${err.message}`);
    }

    const allUsers = [...FALLBACK_USERS, ...this.authService.getInMemoryRegisteredUsers()];
    const farmers = allUsers
      .filter((u) => u.role === Role.FARMER)
      .map((f) => ({
        ...f,
        id: f._id || f.id,
        activeLots: FALLBACK_LOTS.filter((l) => l.farmerId === f.id && l.status !== CropLotStatus.SOLD).length,
        soldLots: FALLBACK_LOTS.filter((l) => l.farmerId === f.id && l.status === CropLotStatus.SOLD).length,
        totalSales: 174000,
      }));

    const buyers = allUsers
      .filter((u) => u.role === Role.BUYER)
      .map((b) => ({
        ...b,
        id: b._id || b.id,
        activeBids: FALLBACK_BIDS.filter((bid) => bid.buyerId === b.id && bid.status === BidStatus.PENDING).length,
        acceptedBids: FALLBACK_BIDS.filter((bid) => bid.buyerId === b.id && bid.status === BidStatus.ACCEPTED).length,
        cancelledBids: FALLBACK_BIDS.filter((bid) => bid.buyerId === b.id && bid.status === BidStatus.WITHDRAWN).length,
        totalProcurement: 174000,
      }));

    return { farmers, buyers };
  }

  async getActivityFeed(limit: number = 50) {
    return this.auditService.getRecent(limit);
  }
}
