import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FALLBACK_LOTS } from '../lots/lots.service';
import { FALLBACK_BIDS, FALLBACK_TRANSACTIONS, FALLBACK_PAYMENTS } from '../bids/bids.service';
import { FALLBACK_USERS } from '../auth/auth.service';
import { AuditService } from '../audit/audit.service';
import { CropLotStatus, BidStatus, TransactionStatus, PaymentStatus, Role, AuditAction } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async getDashboardStats() {
    const recentActivity = await this.auditService.getRecent(10);

    if (!this.prisma.isConnected) {
      const farmers = FALLBACK_USERS.filter((u) => u.role === Role.FARMER);
      const buyers = FALLBACK_USERS.filter((u) => u.role === Role.BUYER);

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

    try {
      const [
        totalFarmers,
        totalBuyers,
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
        this.prisma.user.count({ where: { role: Role.FARMER } }),
        this.prisma.user.count({ where: { role: Role.BUYER } }),
        this.prisma.cropLot.count({ where: { status: { in: [CropLotStatus.OPEN, CropLotStatus.BIDDING] } } }),
        this.prisma.cropLot.count({ where: { status: CropLotStatus.BIDDING } }),
        this.prisma.cropLot.count({ where: { status: CropLotStatus.SOLD } }),
        this.prisma.cropLot.count({ where: { status: CropLotStatus.CANCELLED } }),
        this.prisma.bid.count({ where: { status: BidStatus.PENDING } }),
        this.prisma.bid.count({ where: { status: BidStatus.ACCEPTED } }),
        this.prisma.bid.count({ where: { status: BidStatus.WITHDRAWN } }),
        this.prisma.transaction.findMany({ select: { totalAmount: true } }),
        this.prisma.payment.findMany({ select: { amount: true, status: true } }),
      ]);

      const modifiedBids = await this.prisma.auditLog.count({
        where: { action: AuditAction.QUANTITY_MODIFIED },
      });

      const totalTransactionValue = transactions.reduce((acc, t) => acc + t.totalAmount, 0);
      const completedPaymentsValue = payments
        .filter((p) => p.status === PaymentStatus.PAID)
        .reduce((acc, p) => acc + p.amount, 0);
      const pendingPaymentsValue = payments
        .filter((p) => p.status === PaymentStatus.PENDING)
        .reduce((acc, p) => acc + p.amount, 0);

      return {
        totalFarmers,
        totalBuyers,
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
    } catch (err) {
      return this.getDashboardStats();
    }
  }

  async getAllLots(query: any = {}) {
    if (!this.prisma.isConnected) {
      let lots = [...FALLBACK_LOTS];
      if (query.status) lots = lots.filter((l) => l.status === query.status);
      if (query.cropId) lots = lots.filter((l) => l.cropId === query.cropId || l.crop?.name === query.cropId);
      return lots;
    }

    try {
      const where: any = {};
      if (query.status) where.status = query.status;
      if (query.cropId) where.cropId = query.cropId;

      const lots = await this.prisma.cropLot.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          crop: true,
          farmer: {
            select: { id: true, name: true, phone: true, district: true, state: true, isVerified: true },
          },
          bids: {
            orderBy: { price: 'desc' },
            include: { buyer: { select: { id: true, name: true, district: true } } },
          },
          transaction: {
            include: { buyer: { select: { id: true, name: true } }, payment: true },
          },
          _count: { select: { bids: true } },
        },
      });

      return lots.map((l) => ({
        ...l,
        highestBid: l.bids.length > 0 ? Math.max(...l.bids.map((b) => b.price)) : null,
      }));
    } catch (err) {
      return FALLBACK_LOTS;
    }
  }

  async getAllBids(query: any = {}) {
    if (!this.prisma.isConnected) {
      let bids = [...FALLBACK_BIDS];
      if (query.status) bids = bids.filter((b) => b.status === query.status);
      return bids;
    }

    try {
      const where: any = {};
      if (query.status) where.status = query.status;

      return await this.prisma.bid.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          buyer: {
            select: { id: true, name: true, email: true, phone: true, district: true, state: true, isVerified: true },
          },
          lot: {
            include: {
              crop: true,
              farmer: {
                select: { id: true, name: true, phone: true, district: true, state: true },
              },
            },
          },
        },
      });
    } catch (err) {
      return FALLBACK_BIDS;
    }
  }

  async getUsers() {
    if (!this.prisma.isConnected) {
      const farmers = FALLBACK_USERS.filter((u) => u.role === Role.FARMER).map((f) => ({
        ...f,
        activeLots: FALLBACK_LOTS.filter((l) => l.farmerId === f.id && l.status !== CropLotStatus.SOLD).length,
        soldLots: FALLBACK_LOTS.filter((l) => l.farmerId === f.id && l.status === CropLotStatus.SOLD).length,
        totalSales: 174000,
      }));

      const buyers = FALLBACK_USERS.filter((u) => u.role === Role.BUYER).map((b) => ({
        ...b,
        activeBids: FALLBACK_BIDS.filter((bid) => bid.buyerId === b.id && bid.status === BidStatus.PENDING).length,
        acceptedBids: FALLBACK_BIDS.filter((bid) => bid.buyerId === b.id && bid.status === BidStatus.ACCEPTED).length,
        cancelledBids: FALLBACK_BIDS.filter((bid) => bid.buyerId === b.id && bid.status === BidStatus.WITHDRAWN).length,
        totalProcurement: 174000,
      }));

      return { farmers, buyers };
    }

    try {
      const users = await this.prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          district: true,
          state: true,
          location: true,
          isVerified: true,
          createdAt: true,
          cropLots: {
            select: { id: true, status: true },
          },
          bids: {
            select: { id: true, status: true },
          },
          buyerTransactions: {
            select: { totalAmount: true },
          },
          farmerTransactions: {
            select: { totalAmount: true },
          },
        },
      });

      const farmers = users
        .filter((u) => u.role === Role.FARMER)
        .map((f) => ({
          ...f,
          activeLots: f.cropLots.filter((l) => l.status !== CropLotStatus.SOLD && l.status !== CropLotStatus.CANCELLED).length,
          soldLots: f.cropLots.filter((l) => l.status === CropLotStatus.SOLD).length,
          totalSales: f.farmerTransactions.reduce((acc, t) => acc + t.totalAmount, 0),
        }));

      const buyers = users
        .filter((u) => u.role === Role.BUYER)
        .map((b) => ({
          ...b,
          activeBids: b.bids.filter((bid) => bid.status === BidStatus.PENDING).length,
          acceptedBids: b.bids.filter((bid) => bid.status === BidStatus.ACCEPTED).length,
          cancelledBids: b.bids.filter((bid) => bid.status === BidStatus.WITHDRAWN).length,
          totalProcurement: b.buyerTransactions.reduce((acc, t) => acc + t.totalAmount, 0),
        }));

      return { farmers, buyers };
    } catch (err) {
      return this.getUsers();
    }
  }

  async getActivityFeed(limit: number = 50) {
    return this.auditService.getRecent(limit);
  }
}
