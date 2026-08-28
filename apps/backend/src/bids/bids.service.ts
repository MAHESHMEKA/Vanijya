import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBidDto } from './dto/create-bid.dto';
import { BidStatus, CropLotStatus, PaymentStatus, Role, TransactionStatus, AuditAction } from '@prisma/client';
import { FALLBACK_LOTS } from '../lots/lots.service';
import { FALLBACK_USERS } from '../auth/auth.service';
import { AuditService } from '../audit/audit.service';

export const FALLBACK_BIDS: any[] = [
  {
    id: 'bid-demo-1',
    lotId: 'lot-demo-1',
    buyerId: 'usr-buyer-1',
    price: 2250,
    quantity: 100,
    message: 'Direct warehouse pickup, ready for instant bank settlement',
    status: BidStatus.PENDING,
    createdAt: new Date(Date.now() - 3600000),
    updatedAt: new Date(Date.now() - 3600000),
    buyer: {
      id: 'usr-buyer-1',
      name: 'FreshCart Agro Ltd.',
      district: 'Mumbai',
      state: 'Maharashtra',
      isVerified: true,
    },
    lot: {
      id: 'lot-demo-1',
      cropId: 'crop-1',
      quantity: 100,
      unit: 'QUINTAL',
      expectedPrice: 2200,
      crop: { id: 'crop-1', name: 'Tomato' },
      farmer: { id: 'usr-farmer-1', name: 'Ramesh Patel' },
    },
  },
  {
    id: 'bid-demo-2',
    lotId: 'lot-demo-2',
    buyerId: 'usr-buyer-2',
    price: 1700,
    quantity: 50,
    message: 'Advance payment on pickup',
    status: BidStatus.WITHDRAWN,
    createdAt: new Date(Date.now() - 7200000),
    updatedAt: new Date(Date.now() - 3600000),
    buyer: {
      id: 'usr-buyer-2',
      name: 'GreenSpire Foods',
      district: 'Delhi',
      state: 'Delhi',
      isVerified: true,
    },
    lot: {
      id: 'lot-demo-2',
      cropId: 'crop-2',
      quantity: 80,
      unit: 'QUINTAL',
      expectedPrice: 1650,
      crop: { id: 'crop-2', name: 'Onion' },
      farmer: { id: 'usr-farmer-1', name: 'Ramesh Patel' },
    },
  },
];

export const FALLBACK_TRANSACTIONS: any[] = [];
export const FALLBACK_PAYMENTS: any[] = [];

@Injectable()
export class BidsService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async createBid(lotId: string, buyerId: string, dto: CreateBidDto) {
    if (!this.prisma.isConnected) {
      return this.createBidInMemory(lotId, buyerId, dto);
    }

    try {
      const lot = await this.prisma.cropLot.findUnique({
        where: { id: lotId },
      });
      if (!lot) throw new NotFoundException(`Crop lot with ID ${lotId} not found.`);
      if (lot.farmerId === buyerId) throw new BadRequestException('You cannot place a bid on your own crop lot.');
      if (lot.status !== CropLotStatus.OPEN && lot.status !== CropLotStatus.BIDDING) {
        throw new BadRequestException(`Cannot place a bid on lot with status ${lot.status}.`);
      }
      if (dto.price <= 0) throw new BadRequestException('Bid price must be greater than 0.');
      if (dto.quantity <= 0 || dto.quantity > lot.quantity) {
        throw new BadRequestException(`Bid quantity must be between 1 and ${lot.quantity} ${lot.unit}.`);
      }

      const [bid] = await this.prisma.$transaction([
        this.prisma.bid.create({
          data: {
            lotId,
            buyerId,
            price: dto.price,
            quantity: dto.quantity,
            message: dto.message,
            status: BidStatus.PENDING,
          },
          include: {
            buyer: {
              select: {
                id: true,
                name: true,
                district: true,
                state: true,
                isVerified: true,
              },
            },
            lot: {
              include: { crop: true },
            },
          },
        }),
        this.prisma.cropLot.update({
          where: { id: lotId },
          data: { status: CropLotStatus.BIDDING },
        }),
      ]);

      await this.auditService.log({
        actorId: buyerId,
        action: AuditAction.BID_PLACED,
        lotId,
        bidId: bid.id,
        price: dto.price,
        newQuantity: dto.quantity,
        metadata: { cropName: bid.lot?.crop?.name, message: dto.message },
      });

      return bid;
    } catch (err) {
      if (err instanceof NotFoundException || err instanceof BadRequestException) throw err;
      return this.createBidInMemory(lotId, buyerId, dto);
    }
  }

  private async createBidInMemory(lotId: string, buyerId: string, dto: CreateBidDto) {
    const lot = FALLBACK_LOTS.find((l) => l.id === lotId);
    if (!lot) throw new NotFoundException(`Crop lot with ID ${lotId} not found.`);
    if (lot.farmerId === buyerId) {
      throw new BadRequestException('You cannot place a bid on your own crop lot.');
    }
    if (lot.status !== CropLotStatus.OPEN && lot.status !== CropLotStatus.BIDDING) {
      throw new BadRequestException(`Cannot place a bid on lot with status ${lot.status}.`);
    }
    if (Number(dto.price) <= 0) {
      throw new BadRequestException('Bid price must be greater than 0.');
    }
    if (Number(dto.quantity) <= 0 || Number(dto.quantity) > lot.quantity) {
      throw new BadRequestException(`Bid quantity must be between 1 and ${lot.quantity} ${lot.unit || 'QUINTAL'}.`);
    }

    lot.status = CropLotStatus.BIDDING;
    if (!lot._count) lot._count = { bids: 0 };
    lot._count.bids = (lot._count.bids || 0) + 1;

    const buyerUser = FALLBACK_USERS.find((u) => u.id === buyerId) || {
      id: buyerId,
      name: 'FreshCart Agro Ltd.',
      district: 'Mumbai',
      state: 'Maharashtra',
      isVerified: true,
    };

    const lotSummary = {
      id: lot.id,
      cropId: lot.cropId,
      quantity: lot.quantity,
      unit: lot.unit,
      expectedPrice: lot.expectedPrice,
      qualityGrade: lot.qualityGrade,
      location: lot.location,
      status: lot.status,
      crop: lot.crop,
      farmer: lot.farmer,
    };

    const newBid = {
      id: `bid-${Date.now()}`,
      lotId,
      buyerId,
      price: Number(dto.price),
      quantity: Number(dto.quantity),
      message: dto.message || 'Direct commercial offer',
      status: BidStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
      buyer: {
        id: buyerId,
        name: buyerUser.name,
        district: buyerUser.district,
        state: buyerUser.state,
        isVerified: true,
      },
      lot: lotSummary,
    };

    FALLBACK_BIDS.unshift(newBid);
    if (!lot.bids) lot.bids = [];
    lot.bids.unshift({
      id: newBid.id,
      lotId: newBid.lotId,
      buyerId: newBid.buyerId,
      price: newBid.price,
      quantity: newBid.quantity,
      message: newBid.message,
      status: newBid.status,
      createdAt: newBid.createdAt,
      updatedAt: newBid.updatedAt,
      buyer: newBid.buyer,
    });

    await this.auditService.log({
      actorId: buyerId,
      action: AuditAction.BID_PLACED,
      lotId,
      bidId: newBid.id,
      price: Number(dto.price),
      newQuantity: Number(dto.quantity),
      metadata: { cropName: lot.crop?.name, message: dto.message },
    });

    return newBid;
  }

  async updateBidQuantity(bidId: string, buyerId: string, userRole: Role, newQuantity: number) {
    if (!newQuantity || Number(newQuantity) <= 0) {
      throw new BadRequestException('Quantity must be greater than 0.');
    }

    if (!this.prisma.isConnected) {
      return this.updateBidQuantityInMemory(bidId, buyerId, userRole, newQuantity);
    }

    try {
      const bid = await this.prisma.bid.findUnique({
        where: { id: bidId },
        include: { lot: { include: { crop: true } } },
      });

      if (!bid) throw new NotFoundException(`Bid with ID ${bidId} not found.`);

      if (bid.buyerId !== buyerId && userRole !== Role.ADMIN) {
        throw new ForbiddenException('You are not authorized to modify this bid.');
      }

      if (bid.status !== BidStatus.PENDING) {
        throw new BadRequestException(`Cannot modify quantity of a bid with status ${bid.status}. Only PENDING bids can be modified.`);
      }

      if (bid.lot.status === CropLotStatus.SOLD || bid.lot.status === CropLotStatus.CANCELLED) {
        throw new BadRequestException(`Cannot modify bid because the crop lot is already ${bid.lot.status}.`);
      }

      if (newQuantity > bid.lot.quantity) {
        throw new BadRequestException(`Requested quantity (${newQuantity} ${bid.lot.unit}) exceeds available lot quantity (${bid.lot.quantity} ${bid.lot.unit}).`);
      }

      const oldQuantity = bid.quantity;

      const updatedBid = await this.prisma.bid.update({
        where: { id: bidId },
        data: {
          quantity: newQuantity,
          updatedAt: new Date(),
        },
        include: {
          buyer: {
            select: { id: true, name: true, district: true, state: true, isVerified: true },
          },
          lot: {
            include: { crop: true },
          },
        },
      });

      await this.auditService.log({
        actorId: buyerId,
        action: AuditAction.QUANTITY_MODIFIED,
        bidId,
        lotId: bid.lotId,
        oldQuantity,
        newQuantity,
        price: bid.price,
        metadata: {
          cropName: bid.lot?.crop?.name,
          change: `${oldQuantity} -> ${newQuantity} ${bid.lot.unit}`,
        },
      });

      return updatedBid;
    } catch (err) {
      if (err instanceof NotFoundException || err instanceof BadRequestException || err instanceof ForbiddenException) {
        throw err;
      }
      return this.updateBidQuantityInMemory(bidId, buyerId, userRole, newQuantity);
    }
  }

  private async updateBidQuantityInMemory(bidId: string, buyerId: string, userRole: Role, newQuantity: number) {
    const bid = FALLBACK_BIDS.find((b) => b.id === bidId);
    if (!bid) throw new NotFoundException(`Bid with ID ${bidId} not found.`);

    if (bid.buyerId !== buyerId && userRole !== Role.ADMIN) {
      throw new ForbiddenException('You are not authorized to modify this bid.');
    }

    if (bid.status !== BidStatus.PENDING) {
      throw new BadRequestException(`Cannot modify quantity of a bid with status ${bid.status}. Only PENDING bids can be modified.`);
    }

    const lot = FALLBACK_LOTS.find((l) => l.id === bid.lotId) || bid.lot;
    if (lot && (lot.status === CropLotStatus.SOLD || lot.status === CropLotStatus.CANCELLED)) {
      throw new BadRequestException(`Cannot modify bid because the crop lot is already ${lot.status}.`);
    }

    const lotMaxQty = lot ? lot.quantity : 100;
    if (newQuantity > lotMaxQty) {
      throw new BadRequestException(`Requested quantity (${newQuantity}) exceeds available lot quantity (${lotMaxQty}).`);
    }

    const oldQuantity = bid.quantity;
    bid.quantity = Number(newQuantity);
    bid.updatedAt = new Date();

    if (lot && lot.bids) {
      const lotBid = lot.bids.find((b: any) => b.id === bidId);
      if (lotBid) {
        lotBid.quantity = Number(newQuantity);
        lotBid.updatedAt = new Date();
      }
    }

    await this.auditService.log({
      actorId: buyerId,
      action: AuditAction.QUANTITY_MODIFIED,
      bidId,
      lotId: bid.lotId,
      oldQuantity,
      newQuantity: Number(newQuantity),
      price: bid.price,
      metadata: {
        cropName: lot?.crop?.name || 'Crop',
        change: `${oldQuantity} -> ${newQuantity}`,
      },
    });

    return bid;
  }

  async cancelBid(bidId: string, buyerId: string, userRole: Role) {
    if (!this.prisma.isConnected) {
      return this.cancelBidInMemory(bidId, buyerId, userRole);
    }

    try {
      const bid = await this.prisma.bid.findUnique({
        where: { id: bidId },
        include: { lot: { include: { crop: true } } },
      });

      if (!bid) throw new NotFoundException(`Bid with ID ${bidId} not found.`);

      if (bid.buyerId !== buyerId && userRole !== Role.ADMIN) {
        throw new ForbiddenException('You are not authorized to cancel this bid.');
      }

      if (bid.status !== BidStatus.PENDING) {
        throw new BadRequestException(`Cannot cancel bid with status ${bid.status}. Only PENDING bids can be cancelled.`);
      }

      if (bid.lot.status === CropLotStatus.SOLD) {
        throw new BadRequestException('Cannot cancel bid because the crop lot has already been SOLD.');
      }

      const updatedBid = await this.prisma.bid.update({
        where: { id: bidId },
        data: {
          status: BidStatus.WITHDRAWN,
          updatedAt: new Date(),
        },
        include: {
          buyer: {
            select: { id: true, name: true, district: true, state: true, isVerified: true },
          },
          lot: {
            include: { crop: true },
          },
        },
      });

      // If no other pending bids exist on lot, transition status back to OPEN
      const otherPendingBids = await this.prisma.bid.count({
        where: {
          lotId: bid.lotId,
          id: { not: bidId },
          status: BidStatus.PENDING,
        },
      });

      if (otherPendingBids === 0 && bid.lot.status === CropLotStatus.BIDDING) {
        await this.prisma.cropLot.update({
          where: { id: bid.lotId },
          data: { status: CropLotStatus.OPEN },
        });
      }

      await this.auditService.log({
        actorId: buyerId,
        action: AuditAction.BID_CANCELLED,
        bidId,
        lotId: bid.lotId,
        oldStatus: BidStatus.PENDING,
        newStatus: BidStatus.WITHDRAWN,
        price: bid.price,
        metadata: {
          cropName: bid.lot?.crop?.name,
          reason: 'Cancelled by buyer before farmer acceptance',
        },
      });

      return updatedBid;
    } catch (err) {
      if (err instanceof NotFoundException || err instanceof BadRequestException || err instanceof ForbiddenException) {
        throw err;
      }
      return this.cancelBidInMemory(bidId, buyerId, userRole);
    }
  }

  private async cancelBidInMemory(bidId: string, buyerId: string, userRole: Role) {
    const bid = FALLBACK_BIDS.find((b) => b.id === bidId);
    if (!bid) throw new NotFoundException(`Bid with ID ${bidId} not found.`);

    if (bid.buyerId !== buyerId && userRole !== Role.ADMIN) {
      throw new ForbiddenException('You are not authorized to cancel this bid.');
    }

    if (bid.status !== BidStatus.PENDING) {
      throw new BadRequestException(`Cannot cancel bid with status ${bid.status}. Only PENDING bids can be cancelled.`);
    }

    const lot = FALLBACK_LOTS.find((l) => l.id === bid.lotId) || bid.lot;
    if (lot && lot.status === CropLotStatus.SOLD) {
      throw new BadRequestException('Cannot cancel bid because the crop lot has already been SOLD.');
    }

    bid.status = BidStatus.WITHDRAWN;
    bid.updatedAt = new Date();

    if (lot && lot.bids) {
      const lotBid = lot.bids.find((b: any) => b.id === bidId);
      if (lotBid) {
        lotBid.status = BidStatus.WITHDRAWN;
        lotBid.updatedAt = new Date();
      }

      const activeBids = lot.bids.filter((b: any) => b.status === BidStatus.PENDING);
      if (activeBids.length === 0 && lot.status === CropLotStatus.BIDDING) {
        lot.status = CropLotStatus.OPEN;
      }
    }

    await this.auditService.log({
      actorId: buyerId,
      action: AuditAction.BID_CANCELLED,
      bidId,
      lotId: bid.lotId,
      oldStatus: BidStatus.PENDING,
      newStatus: BidStatus.WITHDRAWN,
      price: bid.price,
      metadata: {
        cropName: lot?.crop?.name || 'Crop',
        reason: 'Cancelled by buyer before farmer acceptance',
      },
    });

    return bid;
  }

  async getLotBids(lotId: string) {
    if (!this.prisma.isConnected) {
      return FALLBACK_BIDS.filter((b) => b.lotId === lotId);
    }

    try {
      return await this.prisma.bid.findMany({
        where: { lotId },
        orderBy: { price: 'desc' },
        include: {
          buyer: {
            select: {
              id: true,
              name: true,
              district: true,
              state: true,
              isVerified: true,
            },
          },
        },
      });
    } catch (err) {
      return FALLBACK_BIDS.filter((b) => b.lotId === lotId);
    }
  }

  async getMyBids(userId: string, role: Role) {
    if (!this.prisma.isConnected) {
      if (role === Role.BUYER) {
        return FALLBACK_BIDS.filter((b) => b.buyerId === userId);
      }
      return FALLBACK_BIDS.filter((b) => b.lot?.farmerId === userId);
    }

    try {
      if (role === Role.BUYER) {
        return await this.prisma.bid.findMany({
          where: { buyerId: userId },
          orderBy: { createdAt: 'desc' },
          include: {
            lot: {
              include: {
                crop: true,
                farmer: {
                  select: {
                    id: true,
                    name: true,
                    district: true,
                    state: true,
                    isVerified: true,
                  },
                },
              },
            },
          },
        });
      }

      return await this.prisma.bid.findMany({
        where: {
          lot: { farmerId: userId },
        },
        orderBy: { createdAt: 'desc' },
        include: {
          buyer: {
            select: {
              id: true,
              name: true,
              district: true,
              state: true,
              isVerified: true,
            },
          },
          lot: {
            include: { crop: true },
          },
        },
      });
    } catch (err) {
      if (role === Role.BUYER) {
        return FALLBACK_BIDS.filter((b) => b.buyerId === userId);
      }
      return FALLBACK_BIDS.filter((b) => b.lot?.farmerId === userId);
    }
  }

  async acceptBid(bidId: string, userId: string, userRole: Role) {
    if (!this.prisma.isConnected) {
      return this.acceptBidInMemory(bidId, userId, userRole);
    }

    try {
      const bid = await this.prisma.bid.findUnique({
        where: { id: bidId },
        include: { lot: { include: { crop: true } } },
      });
      if (!bid) throw new NotFoundException(`Bid with ID ${bidId} not found.`);
      if (bid.lot.farmerId !== userId && userRole !== Role.ADMIN) {
        throw new ForbiddenException('You are not authorized to accept bids for this lot.');
      }
      if (bid.status !== BidStatus.PENDING) {
        throw new BadRequestException(`Cannot accept a bid with status ${bid.status}.`);
      }

      const totalAmount = Math.round(bid.price * bid.quantity * 100) / 100;

      return await this.prisma.$transaction(async (tx) => {
        const acceptedBid = await tx.bid.update({
          where: { id: bidId },
          data: { status: BidStatus.ACCEPTED, updatedAt: new Date() },
        });

        await tx.bid.updateMany({
          where: {
            lotId: bid.lotId,
            id: { not: bidId },
            status: BidStatus.PENDING,
          },
          data: { status: BidStatus.REJECTED, updatedAt: new Date() },
        });

        await tx.cropLot.update({
          where: { id: bid.lotId },
          data: { status: CropLotStatus.SOLD },
        });

        const transaction = await tx.transaction.create({
          data: {
            lotId: bid.lotId,
            buyerId: bid.buyerId,
            farmerId: bid.lot.farmerId,
            acceptedBidId: bid.id,
            agreedPrice: bid.price,
            quantity: bid.quantity,
            totalAmount,
            status: TransactionStatus.INITIATED,
          },
        });

        const payment = await tx.payment.create({
          data: {
            transactionId: transaction.id,
            amount: totalAmount,
            status: PaymentStatus.PENDING,
          },
        });

        await this.auditService.log({
          actorId: userId,
          action: AuditAction.BID_ACCEPTED,
          bidId,
          lotId: bid.lotId,
          price: bid.price,
          newQuantity: bid.quantity,
          metadata: {
            cropName: bid.lot?.crop?.name,
            totalAmount,
            buyerId: bid.buyerId,
          },
        });

        return { acceptedBid, transaction, payment };
      });
    } catch (err) {
      if (err instanceof NotFoundException || err instanceof ForbiddenException || err instanceof BadRequestException) {
        throw err;
      }
      return this.acceptBidInMemory(bidId, userId, userRole);
    }
  }

  private async acceptBidInMemory(bidId: string, userId: string, userRole: Role) {
    const bid = FALLBACK_BIDS.find((b) => b.id === bidId);
    if (!bid) throw new NotFoundException(`Bid with ID ${bidId} not found.`);
    const lot = FALLBACK_LOTS.find((l) => l.id === bid.lotId) || bid.lot;
    if (lot && lot.farmerId !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenException('You are not authorized to accept bids for this lot.');
    }
    if (bid.status !== BidStatus.PENDING) {
      throw new BadRequestException(`Cannot accept a bid with status ${bid.status}.`);
    }

    bid.status = BidStatus.ACCEPTED;
    bid.updatedAt = new Date();

    FALLBACK_BIDS.forEach((b) => {
      if (b.lotId === bid.lotId && b.id !== bidId && b.status === BidStatus.PENDING) {
        b.status = BidStatus.REJECTED;
        b.updatedAt = new Date();
      }
    });

    if (lot) lot.status = CropLotStatus.SOLD;

    const totalAmount = Math.round(bid.price * bid.quantity * 100) / 100;
    const transaction = {
      id: `txn-${Date.now()}`,
      lotId: bid.lotId,
      buyerId: bid.buyerId,
      farmerId: lot ? lot.farmerId : userId,
      acceptedBidId: bid.id,
      agreedPrice: bid.price,
      quantity: bid.quantity,
      totalAmount,
      status: TransactionStatus.INITIATED,
      createdAt: new Date(),
      lot: {
        id: lot.id,
        crop: lot.crop,
        quantity: lot.quantity,
        expectedPrice: lot.expectedPrice,
        location: lot.location,
      },
      buyer: bid.buyer,
      farmer: lot ? lot.farmer : { name: 'Ramesh Patel' },
    };
    FALLBACK_TRANSACTIONS.unshift(transaction);

    const payment = {
      id: `pay-${Date.now()}`,
      transactionId: transaction.id,
      amount: totalAmount,
      status: PaymentStatus.PENDING,
      createdAt: new Date(),
    };
    FALLBACK_PAYMENTS.unshift(payment);

    await this.auditService.log({
      actorId: userId,
      action: AuditAction.BID_ACCEPTED,
      bidId,
      lotId: bid.lotId,
      price: bid.price,
      newQuantity: bid.quantity,
      metadata: {
        cropName: lot?.crop?.name || 'Crop',
        totalAmount,
        buyerId: bid.buyerId,
      },
    });

    return {
      acceptedBid: bid,
      transaction,
      payment,
    };
  }

  async rejectBid(bidId: string, userId: string, userRole: Role) {
    if (!this.prisma.isConnected) {
      const bid = FALLBACK_BIDS.find((b) => b.id === bidId);
      if (!bid) throw new NotFoundException(`Bid with ID ${bidId} not found.`);
      bid.status = BidStatus.REJECTED;
      bid.updatedAt = new Date();
      await this.auditService.log({
        actorId: userId,
        action: AuditAction.BID_REJECTED,
        bidId,
        lotId: bid.lotId,
      });
      return bid;
    }

    try {
      const bid = await this.prisma.bid.findUnique({
        where: { id: bidId },
        include: { lot: true },
      });
      if (!bid) throw new NotFoundException(`Bid with ID ${bidId} not found.`);
      if (bid.lot.farmerId !== userId && userRole !== Role.ADMIN) {
        throw new ForbiddenException('You are not authorized to reject bids for this lot.');
      }
      const updatedBid = await this.prisma.bid.update({
        where: { id: bidId },
        data: { status: BidStatus.REJECTED, updatedAt: new Date() },
      });

      await this.auditService.log({
        actorId: userId,
        action: AuditAction.BID_REJECTED,
        bidId,
        lotId: bid.lotId,
      });

      return updatedBid;
    } catch (err) {
      const bid = FALLBACK_BIDS.find((b) => b.id === bidId);
      if (bid) {
        bid.status = BidStatus.REJECTED;
        bid.updatedAt = new Date();
        return bid;
      }
      throw err;
    }
  }
}
